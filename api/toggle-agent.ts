import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { business_id, enabled } = req.body;

    if (!business_id || typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'business_id and enabled are required' });
    }

    console.log(`Toggling AI for business ${business_id} to ${enabled}`);

    // Update database
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ ai_enabled: enabled })
      .eq('id', business_id);

    if (updateError) {
      console.error('Error updating business:', updateError);
      return res.status(500).json({ error: 'Failed to update AI status' });
    }

    // TODO: If Bland has an API to pause/unpause agents, call it here

    console.log('AI status updated successfully');

    return res.status(200).json({ 
      success: true, 
      enabled,
      message: enabled ? 'AI agent activated' : 'AI agent deactivated'
    });

  } catch (error) {
    console.error('Toggle agent error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}