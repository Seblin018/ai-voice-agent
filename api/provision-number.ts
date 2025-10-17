import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Build a customized prompt for the septic agent based on user configuration
 * Extends the base septic agent prompt with business-specific details
 */
function buildCustomSepticAgentPrompt(
  businessName: string,
  services: string[],
  pricing: Record<string, any>,
  specialInstructions: string
): string {
  // Build pricing section from user input
  let pricingSection = 'PRICING INFORMATION:\n';
  Object.entries(pricing).forEach(([service, prices]: [string, any]) => {
    if (prices.min && prices.max) {
      pricingSection += `- ${service}: $${prices.min}-$${prices.max}\n`;
    } else if (prices.fixed) {
      pricingSection += `- ${service}: $${prices.fixed}\n`;
    }
  });

  const prompt = `You are a friendly and professional phone receptionist for ${businessName}, a septic service company.

Your job is to:
1. Greet callers warmly
2. Understand what service they need
3. Assess the urgency
4. Collect their information
5. Book an appointment
6. Confirm all details

SERVICES OFFERED:
${services.map(s => `- ${s}`).join('\n')}

${pricingSection}
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
- Never make up pricing - refer to the pricing information above
- Always add: "Final price depends on your specific situation."
- Keep calls under 3 minutes
- If unsure: "Let me have our manager call you back"

TONE: Professional but warm. You're helping someone with a stressful problem.
${specialInstructions ? `\n\nSPECIAL INSTRUCTIONS FROM BUSINESS OWNER:\n${specialInstructions}` : ''}`;

  return prompt;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      business_id,
      business_name,
      email,
      timezone,
      services,
      pricing,
      special_instructions,
    } = req.body;

    // Validate required fields
    if (!business_id || !business_name || !email || !timezone || !services?.length) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['business_id', 'business_name', 'email', 'timezone', 'services'],
      });
    }

    console.log(`[provision-number] Provisioning AI agent for business: ${business_name} (${business_id})`);

    // Get business details from Supabase to verify ownership
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      console.error('[provision-number] Business not found:', businessError);
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if already has an agent
    if (business.bland_agent_id) {
      console.warn(`[provision-number] Business already has agent: ${business.bland_agent_id}`);
      return res.status(400).json({
        error: 'Business already has an AI agent configured',
        agentId: business.bland_agent_id,
      });
    }

    // Build the customized prompt
    const customPrompt = buildCustomSepticAgentPrompt(
      business_name,
      services,
      pricing,
      special_instructions
    );

    console.log('[provision-number] Creating Bland AI agent with custom prompt');

    // Create AI agent with Bland API
    const agentResponse = await fetch('https://api.bland.ai/v1/agents', {
      method: 'POST',
      headers: {
        authorization: process.env.BLAND_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: customPrompt,
        voice_id: 11, // Professional female voice
        model: 'enhanced',
        language: 'en',
        webhook: `https://septicagent.com/api/bland-webhook?business_id=${business_id}`,
        transfer_phone_number: business.phone || '',
        record: true,
        wait_for_greeting: false,
        interruption_threshold: 100,
        max_duration: 12,
      }),
    });

    console.log('[provision-number] Bland API response status:', agentResponse.status);

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('[provision-number] Bland API error:', errorText);
      return res.status(500).json({
        error: 'Failed to create Bland agent',
        status: agentResponse.status,
      });
    }

    const responseText = await agentResponse.text();
    let agentData;

    try {
      agentData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[provision-number] Failed to parse Bland response:', responseText);
      return res.status(500).json({
        error: 'Invalid response from Bland API',
      });
    }

    // Extract agent_id (handle both response formats)
    const agentId = agentData.agent?.agent_id || agentData.agent_id;

    if (!agentId) {
      console.error('[provision-number] No agent_id in response:', agentData);
      return res.status(500).json({
        error: 'Failed to create agent: no agent_id returned',
      });
    }

    console.log('[provision-number] Agent created successfully:', agentId);

    // Update business in Supabase with agent configuration
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        bland_agent_id: agentId,
        email,
        timezone,
        ai_enabled: true,
      })
      .eq('id', business_id);

    if (updateError) {
      console.error('[provision-number] Failed to update business:', updateError);
      return res.status(500).json({
        error: 'Failed to save agent configuration',
      });
    }

    console.log('[provision-number] Business updated successfully');

    return res.status(200).json({
      success: true,
      agentId,
      message: 'AI agent created and configured successfully',
    });
  } catch (error) {
    console.error('[provision-number] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}