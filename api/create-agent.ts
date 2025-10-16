import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CreateAgentRequest {
  business_id: string;
  business_name: string;
  business_phone: string;
  industry: string;
  services: Array<{
    name: string;
    price_min: number;
    price_max: number;
    urgency: string;
  }>;
}

interface BlandAgentResponse {
  agent_id: string;
  [key: string]: any;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { business_id, business_name, business_phone, industry, services }: CreateAgentRequest = req.body;

    // Validate required fields
    if (!business_id || !business_name || !business_phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Creating Bland AI agent for business:', business_name);

    // Create system prompt based on business info
    const systemPrompt = createSystemPrompt(business_name, industry, services);

    // Call Bland AI API to create agent
    const blandResponse = await fetch('https://api.bland.ai/v1/agents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BLAND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${business_name} AI Assistant`,
        prompt: systemPrompt,
        voice: 'professional',
        language: 'en',
        first_message: `Hello! Thank you for calling ${business_name}. I'm an AI assistant here to help you with your ${industry.toLowerCase()} needs. How can I assist you today?`,
        voicemail_message: `Thank you for calling ${business_name}. We're currently unavailable, but I'll make sure to get back to you as soon as possible. Please leave your name, phone number, and a brief message about how we can help you.`,
        voicemail_detection: true,
        interruption_threshold: 3,
        background_sound: 'office',
        transfer_phone_number: business_phone,
        max_duration: 300, // 5 minutes max call
        webhook_url: `${process.env.VERCEL_URL || 'https://your-domain.vercel.app'}/api/bland-webhook`,
        metadata: {
          business_id: business_id,
          business_name: business_name,
          industry: industry
        }
      })
    });

    if (!blandResponse.ok) {
      const errorData = await blandResponse.text();
      console.error('Bland API error:', errorData);
      return res.status(500).json({ error: 'Failed to create Bland AI agent' });
    }

    const agentData: BlandAgentResponse = await blandResponse.json();

    // Update business record with Bland agent info
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        bland_agent_id: agentData.agent_id,
        bland_phone_number: agentData.phone_number,
        ai_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', business_id);

    if (updateError) {
      console.error('Error updating business with agent info:', updateError);
      return res.status(500).json({ error: 'Failed to update business record' });
    }

    console.log('Bland AI agent created successfully:', agentData.agent_id);

    return res.status(200).json({
      success: true,
      agent_id: agentData.agent_id,
      phone_number: agentData.phone_number,
      status: agentData.status
    });

  } catch (error) {
    console.error('Create agent error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to create system prompt based on business info
function createSystemPrompt(businessName: string, industry: string, services: any[]): string {
  const servicesList = services.map(service => 
    `- ${service.name}: $${service.price_min}-$${service.price_max} (${service.urgency} priority)`
  ).join('\n');

  return `You are an AI assistant for ${businessName}, a ${industry} business.

Your role is to:
1. Answer questions about our services professionally
2. Schedule appointments when customers request them
3. Provide pricing information when asked
4. Handle emergency calls with urgency
5. Take detailed notes for follow-up

Available Services:
${servicesList}

Guidelines:
- Always be polite and professional
- Ask for caller's name and phone number
- For appointments, ask about preferred date/time and service needed
- For emergencies, emphasize urgency and same-day availability
- If you can't help with something specific, offer to have someone call back
- Keep calls under 5 minutes unless the customer needs more time
- Always end with "Is there anything else I can help you with today?"

Emergency keywords: urgent, emergency, broken, not working, overflow, backup, flooding
Appointment keywords: schedule, book, appointment, available, time, date, when

Remember: You represent ${businessName} and should maintain our professional standards.`;
}
