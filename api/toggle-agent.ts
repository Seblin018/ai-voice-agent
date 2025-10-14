import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ToggleAgentRequest {
  business_id: string;
  status: 'active' | 'inactive';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { business_id, status }: ToggleAgentRequest = req.body;

    // Validate required fields
    if (!business_id || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate status value
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "active" or "inactive"' });
    }

    console.log(`Toggling AI agent for business ${business_id} to ${status}`);

    // Get business info including Bland agent ID
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('bland_agent_id, bland_phone_number, name')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      console.error('Business not found:', businessError);
      return res.status(404).json({ error: 'Business not found' });
    }

    if (!business.bland_agent_id) {
      return res.status(400).json({ error: 'No Bland AI agent found for this business' });
    }

    // Update agent status in Bland AI
    const blandResponse = await fetch(`https://api.bland.ai/v1/agents/${business.bland_agent_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.BLAND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: status === 'active' ? 'active' : 'paused'
      })
    });

    if (!blandResponse.ok) {
      const errorData = await blandResponse.text();
      console.error('Bland API error:', errorData);
      return res.status(500).json({ error: 'Failed to update Bland AI agent status' });
    }

    // Update business record in database
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        ai_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', business_id);

    if (updateError) {
      console.error('Error updating business status:', updateError);
      return res.status(500).json({ error: 'Failed to update business record' });
    }

    // Log the status change
    await supabase
      .from('ai_activity_log')
      .insert({
        business_id: business_id,
        action: status === 'active' ? 'agent_activated' : 'agent_deactivated',
        details: `AI agent ${status === 'active' ? 'activated' : 'deactivated'} for ${business.name}`,
        created_at: new Date().toISOString()
      });

    console.log(`AI agent ${status} successfully for business ${business_id}`);

    return res.status(200).json({
      success: true,
      status: status,
      message: `AI agent ${status === 'active' ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Toggle agent error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
