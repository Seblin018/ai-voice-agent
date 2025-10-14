import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BlandWebhookPayload {
  call_id: string;
  from: string; // caller phone
  to: string; // business phone
  duration: number;
  recording_url?: string;
  transcript?: string;
  concatenated_transcript?: string;
  variables?: {
    name?: string;
    service?: string;
    urgency?: string;
    appointment_date?: string;
    appointment_time?: string;
    address?: string;
    phone?: string;
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
    const { business_id } = req.query;
    
    if (!business_id) {
      console.error('Missing business_id in query params');
      return res.status(400).json({ error: 'Missing business_id' });
    }

    const payload: BlandWebhookPayload = req.body;
    console.log('Received Bland webhook:', { business_id, call_id: payload.call_id });

    // Extract call data
    const {
      call_id,
      from,
      to,
      duration,
      recording_url,
      transcript,
      concatenated_transcript,
      variables = {}
    } = payload;

    // Determine outcome from transcript or variables
    let outcome = 'No Action';
    if (variables.appointment_date && variables.appointment_time) {
      outcome = 'Appointment Booked';
    } else if (transcript?.toLowerCase().includes('emergency')) {
      outcome = 'Emergency';
    } else if (transcript?.toLowerCase().includes('quote') || transcript?.toLowerCase().includes('price')) {
      outcome = 'Quote Request';
    } else if (transcript?.toLowerCase().includes('information')) {
      outcome = 'Information Request';
    }

    // Insert call record
    const { data: callData, error: callError } = await supabase
      .from('calls')
      .insert({
        business_id,
        caller_phone: from,
        caller_name: variables.name || null,
        start_time: new Date(Date.now() - duration * 1000).toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: duration,
        outcome,
        service_requested: variables.service || null,
        recording_url: recording_url || null,
        transcript: concatenated_transcript || transcript || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (callError) {
      console.error('Error inserting call:', callError);
      return res.status(500).json({ error: 'Failed to save call data' });
    }

    console.log('Call saved:', callData.id);

    // If appointment was booked, create appointment record
    if (outcome === 'Appointment Booked' && variables.appointment_date && variables.appointment_time) {
      const appointmentDateTime = new Date(`${variables.appointment_date}T${variables.appointment_time}`);
      
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          business_id,
          customer_name: variables.name || 'Unknown',
          customer_phone: from,
          customer_address: variables.address || null,
          service_type: variables.service || 'General Service',
          appointment_date: appointmentDateTime.toISOString(),
          status: 'scheduled',
          call_id: callData.id,
          notes: `Booked via AI call. Urgency: ${variables.urgency || 'Standard'}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        // Don't fail the webhook if appointment creation fails
      } else {
        console.log('Appointment created:', appointmentData.id);
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
          outcome
        },
        created_at: new Date().toISOString()
      });

    console.log('Webhook processed successfully');
    return res.status(200).json({ success: true, call_id });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}