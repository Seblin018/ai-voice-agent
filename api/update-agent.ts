import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UpdateAgentRequest {
  business_id: string;
  business_name?: string;
  business_phone?: string;
  industry?: string;
  services?: Array<{
    name: string;
    price_min: number;
    price_max: number;
    urgency: string;
  }>;
  business_hours?: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const updateData: UpdateAgentRequest = req.body;
    const { business_id, ...updates } = updateData;

    // Validate required fields
    if (!business_id) {
      return res.status(400).json({ error: 'Missing business_id' });
    }

    console.log('Updating Bland AI agent for business:', business_id);

    // Get current business info
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('bland_agent_id, name, industry, services')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      console.error('Business not found:', businessError);
      return res.status(404).json({ error: 'Business not found' });
    }

    if (!business.bland_agent_id) {
      return res.status(400).json({ error: 'No Bland AI agent found for this business' });
    }

    // Prepare update payload for Bland AI
    const blandUpdatePayload: any = {};

    // Update agent name if business name changed
    if (updates.business_name) {
      blandUpdatePayload.name = `${updates.business_name} AI Assistant`;
    }

    // Update system prompt if business info, services, or hours changed
    if (updates.business_name || updates.industry || updates.services || updates.business_hours) {
      const currentServices = updates.services || business.services || [];
      const currentIndustry = updates.industry || business.industry;
      const currentBusinessName = updates.business_name || business.name;
      
      blandUpdatePayload.prompt = createSystemPrompt(
        currentBusinessName,
        currentIndustry,
        currentServices,
        updates.business_hours
      );
    }

    // Update first message if business name changed
    if (updates.business_name) {
      blandUpdatePayload.first_message = `Hello! Thank you for calling ${updates.business_name}. I'm an AI assistant here to help you with your ${(updates.industry || business.industry).toLowerCase()} needs. How can I assist you today?`;
    }

    // Update voicemail message if business name changed
    if (updates.business_name) {
      blandUpdatePayload.voicemail_message = `Thank you for calling ${updates.business_name}. We're currently unavailable, but I'll make sure to get back to you as soon as possible. Please leave your name, phone number, and a brief message about how we can help you.`;
    }

    // Update transfer phone number if business phone changed
    if (updates.business_phone) {
      blandUpdatePayload.transfer_phone_number = updates.business_phone;
    }

    // Update metadata
    blandUpdatePayload.metadata = {
      business_id: business_id,
      business_name: updates.business_name || business.name,
      industry: updates.industry || business.industry,
      updated_at: new Date().toISOString()
    };

    // Call Bland AI API to update agent
    const blandResponse = await fetch(`https://api.bland.ai/v1/agents/${business.bland_agent_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.BLAND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blandUpdatePayload)
    });

    if (!blandResponse.ok) {
      const errorData = await blandResponse.text();
      console.error('Bland API error:', errorData);
      return res.status(500).json({ error: 'Failed to update Bland AI agent' });
    }

    // Update business record in database
    const businessUpdateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.business_name) businessUpdateData.name = updates.business_name;
    if (updates.business_phone) businessUpdateData.phone = updates.business_phone;
    if (updates.industry) businessUpdateData.industry = updates.industry;
    if (updates.services) businessUpdateData.services = updates.services;
    if (updates.business_hours) businessUpdateData.business_hours = updates.business_hours;

    const { error: updateError } = await supabase
      .from('businesses')
      .update(businessUpdateData)
      .eq('id', business_id);

    if (updateError) {
      console.error('Error updating business record:', updateError);
      return res.status(500).json({ error: 'Failed to update business record' });
    }

    // Log the update
    await supabase
      .from('ai_activity_log')
      .insert({
        business_id: business_id,
        action: 'agent_updated',
        details: `AI agent settings updated for ${updates.business_name || business.name}`,
        created_at: new Date().toISOString()
      });

    console.log('Bland AI agent updated successfully for business:', business_id);

    return res.status(200).json({
      success: true,
      message: 'AI agent updated successfully'
    });

  } catch (error) {
    console.error('Update agent error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to create system prompt with business hours
function createSystemPrompt(
  businessName: string, 
  industry: string, 
  services: any[], 
  businessHours?: any
): string {
  const servicesList = services.map(service => 
    `- ${service.name}: $${service.price_min}-$${service.price_max} (${service.urgency} priority)`
  ).join('\n');

  let hoursInfo = '';
  if (businessHours) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    hoursInfo = '\n\nBusiness Hours:\n' + days.map((day, index) => {
      const hours = businessHours[day];
      if (hours.open === 'Closed') {
        return `${dayNames[index]}: Closed`;
      }
      return `${dayNames[index]}: ${hours.open} - ${hours.close}`;
    }).join('\n');
  }

  return `You are an AI assistant for ${businessName}, a ${industry} business.

Your role is to:
1. Answer questions about our services professionally
2. Schedule appointments when customers request them
3. Provide pricing information when asked
4. Handle emergency calls with urgency
5. Take detailed notes for follow-up

Available Services:
${servicesList}${hoursInfo}

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
