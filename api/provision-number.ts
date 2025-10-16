import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ADD THESE TYPES:
interface BlandAgentResponse {
  agent_id: string;
  [key: string]: any;
}

interface BlandPhoneResponse {
  phone_number: string;
  [key: string]: any;
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // We'll add this env var
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { business_id } = req.body;

    if (!business_id) {
      return res.status(400).json({ error: 'business_id is required' });
    }

    console.log('Provisioning number for business:', business_id);

    // Get business details
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if already has a number
    if (business.ai_phone_number) {
      return res.status(400).json({ 
        error: 'Business already has an AI phone number',
        phoneNumber: business.ai_phone_number 
      });
    }

    console.log('Creating Bland AI agent for:', business.name);

    const agentResponse = await fetch('https://api.bland.ai/v1/agents', {
      method: 'POST',
      headers: {
        'authorization': process.env.BLAND_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: getSepticAgentPrompt(business.name),
        voice_id: 11,
        model: 'enhanced',
        language: 'en',
        webhook: `https://septicagent.com/api/bland-webhook?business_id=${business_id}`,
        record: true,
        wait_for_greeting: false,
        interruption_threshold: 100,
        max_duration: 12,
      })
    });

    console.log('Bland response status:', agentResponse.status);
    console.log('Bland response headers:', agentResponse.headers);

    // Check if response is actually JSON
    const contentType = agentResponse.headers.get('content-type');
    console.log('Content-Type:', contentType);

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('Bland API error response:', errorText);
      return res.status(500).json({ 
        error: 'Bland API error', 
        status: agentResponse.status,
        details: errorText 
      });
    }

    // Try to get text first, then parse
    const responseText = await agentResponse.text();
    console.log('Bland response body:', responseText);

    let agentData;
    try {
      agentData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Bland response as JSON');
      console.error('Response was:', responseText);
      return res.status(500).json({ 
        error: 'Bland returned invalid JSON', 
        response: responseText.substring(0, 500) 
      });
    }

    console.log('Agent created:', agentData.agent_id);

    // Purchase phone number
    const phoneResponse = await fetch('https://api.bland.ai/v1/inbound', {
      method: 'POST',
      headers: {
        'authorization': process.env.BLAND_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent_id: agentData.agent_id,
        // Optionally specify area code based on business location
      })
    });

    if (!phoneResponse.ok) {
      const error = await phoneResponse.json();
      console.error('Phone number purchase failed:', error);
      return res.status(500).json({ error: 'Failed to purchase phone number', details: error });
    }

    const phoneData = await phoneResponse.json() as BlandPhoneResponse;
    console.log('Phone number purchased:', phoneData.phone_number);

    // Update business with phone number and agent ID
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        ai_phone_number: phoneData.phone_number,
        bland_agent_id: agentData.agent_id,
        ai_enabled: true,
      })
      .eq('id', business_id);

    if (updateError) {
      console.error('Failed to update business:', updateError);
      return res.status(500).json({ error: 'Failed to save phone number' });
    }

    console.log('Successfully provisioned AI agent for business:', business_id);

    return res.status(200).json({
      success: true,
      phoneNumber: phoneData.phone_number,
      agentId: agentData.agent_id,
    });

  } catch (error) {
    console.error('Provision number error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
  }
}

function getSepticAgentPrompt(businessName: string) {
  return `
You are a friendly and professional phone receptionist for ${businessName}, a septic service company.

Your job is to:
1. Greet callers warmly
2. Understand what service they need
3. Assess the urgency
4. Collect their information
5. Book an appointment
6. Confirm all details

CONVERSATION FLOW:
1. Greeting: "Thank you for calling ${businessName}. How can I help you today?"

2. Identify service needed:
   - Emergency pumping (sewage backing up, toilets overflowing)
   - Routine pumping (regular maintenance)
   - Inspection (pre-sale, annual checkup)
   - Drain field issues (soggy yard, slow drains)
   - New system installation

3. Assess urgency:
   - If emergency: "I understand this is urgent. Let me get you scheduled right away."
   - If routine: "I can help you schedule that. When works best for you?"

4. Collect information:
   - "May I have your name please?"
   - "What's the best phone number to reach you?"
   - "What's the property address where you need service?"
   - "Can you briefly describe the issue?"

5. Book appointment:
   - Offer 2-3 time slots
   - "I can get a technician out tomorrow at 9am, or this afternoon at 2pm. Which works better?"

6. Confirm:
   - "Just to confirm: [service] on [date] at [time] at [address]. You'll receive a confirmation text shortly."

IMPORTANT:
- Be empathetic for emergencies
- Never make up pricing - say "Our technician will provide a quote on-site"
- Keep calls under 3 minutes
- If unsure: "Let me have our manager call you back"

PRICING (approximate):
- Emergency pumping: $400-600
- Routine pumping: $250-400
- Inspections: $150-250
- Drain field repairs: $800-1500
- New installations: $3000-8000+

Always add: "Final price depends on your specific situation."
`.trim();
}