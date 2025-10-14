import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ProvisionNumberRequest {
  business_id: string;
  area_code?: string; // Optional area code preference
}

interface BlandPhoneNumber {
  phone_number: string;
  area_code: string;
  monthly_cost: number;
  setup_cost: number;
}

interface BlandAgent {
  agent_id: string;
  phone_number: string;
  status: string;
}

interface BlandPhoneSearchResponse {
  phone_numbers: BlandPhoneNumber[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { business_id, area_code }: ProvisionNumberRequest = req.body;

    // Validate required fields
    if (!business_id) {
      return res.status(400).json({ error: 'Missing business_id' });
    }

    console.log('Provisioning phone number for business:', business_id);

    // Get business information
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, industry, services, phone')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      console.error('Business not found:', businessError);
      return res.status(404).json({ error: 'Business not found' });
    }

    // Step 1: Search for available phone numbers
    console.log('Searching for available phone numbers...');
    const searchParams = new URLSearchParams({
      area_code: area_code || '555', // Default area code if not specified
      limit: '10'
    });

    const searchResponse = await fetch(`https://api.bland.ai/v1/phone-numbers/search?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!searchResponse.ok) {
      const errorData = await searchResponse.text();
      console.error('Error searching phone numbers:', errorData);
      return res.status(500).json({ error: 'Failed to search phone numbers' });
    }

    const searchData: BlandPhoneSearchResponse = await searchResponse.json();
    
    if (!searchData.phone_numbers || searchData.phone_numbers.length === 0) {
      console.error('No phone numbers available');
      return res.status(400).json({ error: 'No phone numbers available in the requested area' });
    }

    // Select the first available number
    const selectedNumber = searchData.phone_numbers[0];
    console.log('Selected phone number:', selectedNumber.phone_number);

    // Step 2: Purchase the phone number
    console.log('Purchasing phone number...');
    const purchaseResponse = await fetch('https://api.bland.ai/v1/phone-numbers/purchase', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_number: selectedNumber.phone_number
      })
    });

    if (!purchaseResponse.ok) {
      const errorData = await purchaseResponse.text();
      console.error('Error purchasing phone number:', errorData);
      return res.status(500).json({ error: 'Failed to purchase phone number' });
    }

    const purchaseData = await purchaseResponse.json();
    console.log('Phone number purchased successfully:', purchaseData);

    // Step 3: Create Bland AI agent
    console.log('Creating Bland AI agent...');
    const agentResponse = await fetch('https://api.bland.ai/v1/agents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `${business.name} AI Assistant`,
        prompt: createSystemPrompt(business.name, business.industry, business.services),
        voice: 'maya', // Professional female voice
        model: 'enhanced', // Better quality
        language: 'en',
        webhook_url: `${process.env.VERCEL_URL || 'https://your-domain.vercel.app'}/api/bland-webhook?business_id=${business_id}`,
        transfer_phone_number: business.phone, // Fallback to business phone
        record: true,
        wait_for_greeting: false,
        interruption_threshold: 100,
        metadata: {
          business_id: business_id,
          business_name: business.name,
          industry: business.industry
        }
      })
    });

    if (!agentResponse.ok) {
      const errorData = await agentResponse.text();
      console.error('Error creating Bland AI agent:', errorData);
      return res.status(500).json({ error: 'Failed to create Bland AI agent' });
    }

    const agentData: BlandAgent = await agentResponse.json();
    console.log('Bland AI agent created successfully:', agentData.agent_id);

    // Step 4: Link phone number to agent
    console.log('Linking phone number to agent...');
    const linkResponse = await fetch(`https://api.bland.ai/v1/phone-numbers/${selectedNumber.phone_number}/link`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent_id: agentData.agent_id
      })
    });

    if (!linkResponse.ok) {
      const errorData = await linkResponse.text();
      console.error('Error linking phone number to agent:', errorData);
      return res.status(500).json({ error: 'Failed to link phone number to agent' });
    }

    console.log('Phone number linked to agent successfully');

    // Step 5: Update business record in Supabase
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        bland_agent_id: agentData.agent_id,
        bland_phone_number: selectedNumber.phone_number,
        ai_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', business_id);

    if (updateError) {
      console.error('Error updating business record:', updateError);
      return res.status(500).json({ error: 'Failed to update business record' });
    }

    // Log the provisioning activity
    await supabase
      .from('ai_activity_log')
      .insert({
        business_id: business_id,
        action: 'phone_number_provisioned',
        details: `Phone number ${selectedNumber.phone_number} provisioned and linked to agent ${agentData.agent_id}`,
        created_at: new Date().toISOString()
      });

    console.log('Phone number provisioning completed successfully for business:', business_id);

    return res.status(200).json({
      success: true,
      phone_number: selectedNumber.phone_number,
      agent_id: agentData.agent_id,
      monthly_cost: selectedNumber.monthly_cost,
      setup_cost: selectedNumber.setup_cost,
      message: 'Phone number provisioned and AI agent created successfully'
    });

  } catch (error) {
    console.error('Provision number error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to create system prompt based on business info
function createSystemPrompt(businessName: string, industry: string, services: any[]): string {
  const servicesList = services?.map(service => 
    `- ${service.name}: $${service.price_min}-$${service.price_max} (${service.urgency} priority)`
  ).join('\n') || '';

  return `You are a professional phone receptionist for ${businessName}, a ${industry} business.

Your role is to:
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

Available Services:
${servicesList}

PRICING GUIDELINES:
- Emergency pumping: $400-600
- Routine pumping: $250-400
- Inspections: $150-250
- Drain field repairs: $800-1500
- New system installation: $3000-8000+

Say "These are approximate ranges. Final pricing depends on your specific situation."

Emergency keywords: urgent, emergency, broken, not working, overflow, backup, flooding
Appointment keywords: schedule, book, appointment, available, time, date, when

Remember: You represent ${businessName} and should maintain our professional standards.`;
}
