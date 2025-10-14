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
    const { business_id, area_code } = req.body;
    
    if (!business_id) {
      return res.status(400).json({ error: 'Missing business_id' });
    }

    console.log('Provisioning phone number for business:', business_id);

    // 1. Fetch business details from Supabase
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      console.error('Business not found:', businessError);
      return res.status(404).json({ error: 'Business not found' });
    }

    // 2. Search for available phone numbers
    const searchResponse = await fetch('https://api.bland.ai/v1/phone-numbers/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        area_code: area_code || '555', // Use provided area code or default
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

    // 3. Purchase the first available number
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

    // 4. Create Bland AI agent with septic prompt
    const septicPrompt = `You are a friendly and professional phone receptionist for a septic service company.

Your job is to:
1. Greet callers warmly
2. Understand what service they need
3. Assess the urgency
4. Collect their information
5. Book an appointment
6. Confirm all details

CONVERSATION FLOW:
1. Greeting: "Thank you for calling ${business.name}. How can I help you today?"

2. Listen and identify service needed:
   - Emergency pumping (sewage backing up, toilets overflowing)
   - Routine pumping (regular maintenance)
   - Inspection (pre-sale, annual checkup)
   - Drain field issues (soggy yard, slow drains)
   - New system installation

3. Assess urgency:
   - If emergency (raw sewage, immediate problem): "I understand this is urgent. Let me get you scheduled right away."
   - If routine: "I can help you schedule that. When works best for you?"

4. Collect information:
   - "May I have your name please?"
   - "And what's the best phone number to reach you?"
   - "What's the property address where you need service?"
   - "Can you briefly describe the issue?"

5. Book appointment:
   - Offer 2-3 specific time slots
   - "I can get a technician out tomorrow at 9am, or this afternoon at 2pm. Which works better?"
   - Confirm the date and time

6. Confirm details:
   - "Just to confirm, I have you scheduled for [service] on [date] at [time] at [address]. Is that correct?"
   - "You'll receive a confirmation text shortly. Our technician will call 30 minutes before arriving."

IMPORTANT RULES:
- Always be empathetic for emergencies
- Speak clearly and naturally
- If you don't understand, politely ask them to repeat
- Never make up pricing - say "Our technician will provide a quote on-site"
- If asked about something you're unsure of: "Let me have our manager call you back to discuss that"
- Keep the call under 3 minutes if possible

PRICING GUIDANCE (approximate ranges):
- Emergency pumping: $400-600
- Routine pumping: $250-400  
- Inspections: $150-250
- Drain field repairs: $800-1500
- New installations: $3000-8000+

Always add: "These are approximate. The exact price depends on your specific situation."

TONE: Professional but warm. You're helping someone with a stressful problem.`;

    const agentResponse = await fetch('https://api.bland.ai/v1/agents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLAND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: septicPrompt,
        voice_id: 11, // Professional female voice
        model: 'enhanced',
        language: 'en',
        webhook: `${process.env.VERCEL_URL || 'https://ai-voice-dashboard.vercel.app'}/api/bland-webhook?business_id=${business_id}`,
        transfer_phone_number: business.phone || selectedNumber.phone_number,
        record: true,
        wait_for_greeting: false,
        interruption_threshold: 100,
        max_duration: 12, // 12 minutes max
      })
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('Error creating agent:', errorText);
      return res.status(500).json({ error: 'Failed to create AI agent' });
    }

    const agentData = await agentResponse.json();
    console.log('Agent created:', agentData);

    // 5. Link the phone number to the agent
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

    // 6. Update Supabase businesses table
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        ai_phone_number: selectedNumber.phone_number,
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
    
    // 7. Return success response
    return res.status(200).json({
      success: true,
      phoneNumber: selectedNumber.phone_number,
      agentId: agentData.agent_id
    });

  } catch (error) {
    console.error('Provisioning error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}