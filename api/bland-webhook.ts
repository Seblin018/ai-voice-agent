import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BlandWebhookPayload {
  call_id: string;
  from: string; // caller phone
  to: string; // business phone
  call_length: number; // duration in seconds
  recording_url?: string;
  transcripts?: Array<{
    role: string;
    message: string;
    timestamp: string;
  }>;
  variables?: {
    name?: string;
    service?: string;
    urgency?: string;
    appointment_date?: string;
    appointment_time?: string;
    address?: string;
    phone?: string;
    appointment_booked?: boolean;
  };
}

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
    // 1. Extract business_id from query params
    const { business_id } = req.query;
    
    if (!business_id) {
      console.error('Missing business_id in query params');
      return res.status(400).json({ error: 'Missing business_id' });
    }

    // 2. Parse webhook payload
    const payload: BlandWebhookPayload = req.body;
    
    // Log all webhook data for debugging
    console.log('=== BLAND WEBHOOK RECEIVED ===');
    console.log('Business ID:', business_id);
    console.log('Full payload:', JSON.stringify(payload, null, 2));
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers);
    console.log('================================');

    const {
      call_id,
      from,
      to,
      call_length,
      recording_url,
      transcripts = [],
      variables = {}
    } = payload;

    // Convert transcripts array to a single transcript string
    const transcriptText = transcripts
      .map(t => `[${t.role}]: ${t.message}`)
      .join('\n');

    // Determine outcome from variables or transcript content
    let outcome = 'No Action';
    if (variables.appointment_booked || (variables.appointment_date && variables.appointment_time)) {
      outcome = 'Appointment Booked';
    } else if (transcriptText.toLowerCase().includes('emergency')) {
      outcome = 'Emergency';
    } else if (transcriptText.toLowerCase().includes('quote') || transcriptText.toLowerCase().includes('price')) {
      outcome = 'Quote Request';
    } else if (transcriptText.toLowerCase().includes('information')) {
      outcome = 'Information Request';
    }

    // 4. Insert into Supabase calls table
    const { data: callData, error: callError } = await supabase
      .from('calls')
      .insert({
        business_id,
        bland_call_id: call_id,
        caller_phone: from,
        business_phone: to,
        caller_name: variables.name || null,
        start_time: new Date(Date.now() - call_length * 1000).toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: call_length,
        outcome,
        service_requested: variables.service || null,
        recording_url: recording_url || null,
        transcript: transcriptText || null,
        raw_webhook_payload: payload,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (callError) {
      console.error('Error inserting call:', callError);
      return res.status(500).json({ error: 'Failed to save call data' });
    }

    console.log('Call saved successfully:', callData.id);

    // 5. If variables contain appointment info, insert into appointments table
    if (variables.appointment_booked || (variables.appointment_date && variables.appointment_time)) {
      const appointmentDateTime = new Date(`${variables.appointment_date}T${variables.appointment_time}`);
      
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          business_id,
          call_id: callData.id,
          customer_name: variables.name || 'Unknown',
          customer_phone: from,
          customer_address: variables.address || null,
          service_requested: variables.service || 'General Service',
          appointment_date: appointmentDateTime.toISOString(),
          status: 'scheduled',
          notes: `Booked via AI call. Urgency: ${variables.urgency || 'Standard'}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        // Don't fail the webhook if appointment creation fails
      } else {
        console.log('Appointment created successfully:', appointmentData.id);
      }
    }

    // Log activity for business
    await supabase
      .from('business_activity_log')
      .insert({
        business_id,
        activity_type: 'call_received',
        description: `New call from ${variables.name || from} - ${variables.service || 'General inquiry'} - ${outcome}`,
        metadata: {
          call_id,
          caller_name: variables.name,
          service: variables.service,
          outcome,
          appointment_booked: variables.appointment_booked || false
        },
        created_at: new Date().toISOString()
      });

    console.log('Webhook processed successfully');
    
    // 6. Return 200 OK with { received: true }
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}