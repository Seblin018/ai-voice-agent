import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BLAND_API_KEY = process.env.BLAND_API_KEY!;

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
    const { business_id, business_name, phone_number, industry } = req.body;
    
    if (!business_id) {
      return res.status(400).json({ error: 'Missing business_id' });
    }

    console.log('Updating AI agent for business:', business_id);

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

    if (!business.bland_agent_id) {
      return res.status(400).json({ error: 'No AI agent configured for this business' });
    }

    // Create updated prompt based on business info
    const updatedPrompt = `You are a professional phone receptionist for ${business_name || business.name}, a ${industry || business.industry || 'septic service'} company. Your job is to:

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

    // Update agent in Bland
    const updateResponse = await fetch(`https://api.bland.ai/v1/agents/${business.bland_agent_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: updatedPrompt,
        transfer_phone_number: phone_number || business.phone || business.bland_phone_number
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Error updating agent in Bland:', errorText);
      return res.status(500).json({ error: 'Failed to update agent settings' });
    }

    const updateResult = await updateResponse.json();
    console.log('Agent updated in Bland:', updateResult);

    // Update business record if needed
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (business_name && business_name !== business.name) {
      updateData.name = business_name;
    }

    if (phone_number && phone_number !== business.phone) {
      updateData.phone = phone_number;
    }

    if (industry && industry !== business.industry) {
      updateData.industry = industry;
    }

    if (Object.keys(updateData).length > 1) { // More than just updated_at
      const { error: updateError } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', business_id);

      if (updateError) {
        console.error('Error updating business in database:', updateError);
        return res.status(500).json({ error: 'Failed to update business record' });
      }
    }

    // Log activity
    await supabase
      .from('business_activity_log')
      .insert({
        business_id,
        activity_type: 'agent_updated',
        description: 'AI agent settings updated',
        metadata: {
          agent_id: business.bland_agent_id,
          changes: {
            business_name: business_name || business.name,
            phone_number: phone_number || business.phone,
            industry: industry || business.industry
          }
        },
        created_at: new Date().toISOString()
      });

    console.log('AI agent updated successfully');
    return res.status(200).json({
      success: true,
      message: 'AI agent settings updated successfully'
    });

  } catch (error) {
    console.error('Update agent error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}