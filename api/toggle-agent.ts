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
    const { business_id, enabled } = req.body;
    
    if (!business_id || typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Missing business_id or enabled status' });
    }

    console.log('Toggling AI agent for business:', business_id, 'enabled:', enabled);

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

    // Update agent status in Bland
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

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Error updating agent in Bland:', errorText);
      return res.status(500).json({ error: 'Failed to update agent status' });
    }

    const updateResult = await updateResponse.json();
    console.log('Agent updated in Bland:', updateResult);

    // Update database
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        ai_status: enabled ? 'active' : 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', business_id);

    if (updateError) {
      console.error('Error updating business in database:', updateError);
      return res.status(500).json({ error: 'Failed to update business record' });
    }

    // Log activity
    await supabase
      .from('business_activity_log')
      .insert({
        business_id,
        activity_type: enabled ? 'ai_activated' : 'ai_deactivated',
        description: `AI agent ${enabled ? 'activated' : 'deactivated'}`,
        metadata: {
          agent_id: business.bland_agent_id,
          phone_number: business.bland_phone_number,
          enabled
        },
        created_at: new Date().toISOString()
      });

    console.log('AI agent toggled successfully');
    return res.status(200).json({
      success: true,
      enabled,
      message: `AI agent ${enabled ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Toggle agent error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}