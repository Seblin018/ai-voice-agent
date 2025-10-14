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
    // 1. Accept POST with { business_id, enabled: boolean }
    const { business_id, enabled } = req.body;
    
    if (!business_id || typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Missing business_id or enabled status' });
    }

    console.log('Toggling AI agent for business:', business_id, 'enabled:', enabled);

    // Get business details to verify it exists
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      console.error('Business not found:', businessError);
      return res.status(404).json({ error: 'Business not found' });
    }

    // 2. Update Supabase businesses.ai_enabled to the new value
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        ai_enabled: enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', business_id);

    if (updateError) {
      console.error('Error updating business in database:', updateError);
      return res.status(500).json({ error: 'Failed to update business record' });
    }

    // 3. Optionally: pause/unpause agent in Bland (if API supports it)
    if (business.bland_agent_id) {
      try {
        const updateResponse = await fetch(`https://api.bland.ai/v1/agents/${business.bland_agent_id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${BLAND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            active: enabled
          })
        });

        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log('Agent updated in Bland:', updateResult);
        } else {
          const errorText = await updateResponse.text();
          console.warn('Warning: Could not update agent in Bland:', errorText);
          // Don't fail the request if Bland API fails
        }
      } catch (blandError) {
        console.warn('Warning: Error updating agent in Bland:', blandError);
        // Don't fail the request if Bland API fails
      }
    }

    // Log activity
    await supabase
      .from('business_activity_log')
      .insert({
        business_id,
        activity_type: enabled ? 'ai_enabled' : 'ai_disabled',
        description: `AI agent ${enabled ? 'enabled' : 'disabled'} - ${enabled ? 'will answer calls' : 'will not answer calls'}`,
        metadata: {
          agent_id: business.bland_agent_id,
          phone_number: business.bland_phone_number,
          enabled
        },
        created_at: new Date().toISOString()
      });

    console.log('AI agent toggled successfully');
    
    // 4. Return { success: true, enabled: true/false }
    return res.status(200).json({
      success: true,
      enabled
    });

  } catch (error) {
    console.error('Toggle agent error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}