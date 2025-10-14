import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BLAND_API_KEY = process.env.BLAND_API_KEY!;

interface BlandPhoneNumber {
  phone_number: string;
  cost: number;
  monthly_cost: number;
}

interface BlandAgent {
  agent_id: string;
  phone_number: string;
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { business_id } = req.body;
    
    if (!business_id) {
      return res.status(400).json({ error: 'Missing business_id' });
    }

    console.log('Provisioning phone number for business:', business_id);

    // Get business details
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      console.error('Business not found:', businessError);
      return res.status(404).json({ error: 'Business not found' });
    }

    // Search for available phone numbers
    const searchResponse = await fetch('https://api.bland.ai/v1/phone-numbers/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        area_code: '555', // Default area code, can be made configurable
        limit: 5
      })
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Error searching phone numbers:', errorText);
      return res.status(500).json({ error: 'Failed to search phone numbers' });
    }

    const availableNumbers = await searchResponse.json();
    console.log('Available numbers:', availableNumbers);

    if (!availableNumbers.phone_numbers || availableNumbers.phone_numbers.length === 0) {
      return res.status(400).json({ error: 'No phone numbers available' });
    }

    // Purchase the first available number
    const selectedNumber = availableNumbers.phone_numbers[0];
    const purchaseResponse = await fetch('https://api.bland.ai/v1/phone-numbers/purchase', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_number: selectedNumber.phone_number
      })
    });

    if (!purchaseResponse.ok) {
      const errorText = await purchaseResponse.text();
      console.error('Error purchasing phone number:', errorText);
      return res.status(500).json({ error: 'Failed to purchase phone number' });
    }

    const purchaseResult = await purchaseResponse.json();
    console.log('Phone number purchased:', purchaseResult);

    // Create Bland AI agent
    const agentPrompt = `You are a professional phone receptionist for ${business.name}, a septic service company. Your job is to:

1. Greet callers warmly and professionally
2. Determine what service they need (emergency pumping, routine maintenance, inspection, drain field repair, new installation)
3. Assess urgency (emergency = today, same-day = within 24 hours, flexible = schedule later)
4. Collect their information:
   - Full name
   - Phone number (confirm it back to them)
   - Property address
   - Brief description of the problem
5. Book an appointment by offering 2-3 available time slots
6. Confirm all details before ending the call
7. Let them know they'll receive a confirmation text/email

IMPORTANT RULES:
- Always be empathetic, especially for emergencies
- If someone has raw sewage backing up, treat it as an emergency
- Speak clearly and professionally
- If you don't understand something, politely ask them to repeat it
- Never make up pricing - say "Our technician will provide an exact quote on-site"
- If asked about services you're unsure about, say "Let me have our manager call you back to discuss that"

PRICING GUIDELINES:
- Emergency pumping: $400-600
- Routine pumping: $250-400
- Inspections: $150-250
- Drain field repairs: $800-1500
- New system installation: $3000-8000+

Say "These are approximate ranges. Final pricing depends on your specific situation."`;

    const agentResponse = await fetch('https://api.bland.ai/v1/agents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: agentPrompt,
        voice: 'maya',
        model: 'enhanced',
        language: 'en',
        webhook_url: `${process.env.VERCEL_URL || 'https://ai-voice-dashboard.vercel.app'}/api/bland-webhook?business_id=${business_id}`,
        transfer_phone_number: business.phone || selectedNumber.phone_number,
        record: true,
        wait_for_greeting: false,
        interruption_threshold: 100,
      })
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('Error creating agent:', errorText);
      return res.status(500).json({ error: 'Failed to create AI agent' });
    }

    const agentData = await agentResponse.json();
    console.log('Agent created:', agentData);

    // Link phone number to agent
    const linkResponse = await fetch('https://api.bland.ai/v1/phone-numbers/link', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_number: selectedNumber.phone_number,
        agent_id: agentData.agent_id
      })
    });

    if (!linkResponse.ok) {
      const errorText = await linkResponse.text();
      console.error('Error linking phone number to agent:', errorText);
      return res.status(500).json({ error: 'Failed to link phone number to agent' });
    }

    // Update business with phone number and agent details
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        bland_phone_number: selectedNumber.phone_number,
        bland_agent_id: agentData.agent_id,
        ai_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', business_id);

    if (updateError) {
      console.error('Error updating business:', updateError);
      return res.status(500).json({ error: 'Failed to update business record' });
    }

    // Log activity
    await supabase
      .from('business_activity_log')
      .insert({
        business_id,
        activity_type: 'ai_activated',
        description: `AI agent activated with phone number ${selectedNumber.phone_number}`,
        metadata: {
          phone_number: selectedNumber.phone_number,
          agent_id: agentData.agent_id,
          cost: selectedNumber.cost
        },
        created_at: new Date().toISOString()
      });

    console.log('Phone number provisioned successfully');
    return res.status(200).json({
      success: true,
      phone_number: selectedNumber.phone_number,
      agent_id: agentData.agent_id,
      cost: selectedNumber.cost,
      monthly_cost: selectedNumber.monthly_cost
    });

  } catch (error) {
    console.error('Provisioning error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}