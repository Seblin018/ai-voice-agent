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
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { business_id } = req.query;

    if (!business_id || typeof business_id !== 'string') {
      console.error('No business_id in webhook');
      return res.status(400).json({ error: 'business_id required' });
    }

    console.log('=== BLAND WEBHOOK RECEIVED ===');
    console.log('Business ID:', business_id);
    console.log('Payload:', JSON.stringify(req.body, null, 2));

    const callData = req.body;

    // Extract call information
    const callerPhone = callData.from || callData.phone_number || 'Unknown';
    const duration = callData.call_length || callData.duration || 0;
    const recordingUrl = callData.recording_url || callData.recording;
    const transcript = callData.concatenated_transcript || 
                      (callData.transcripts || []).map((t: any) => t.text).join('\n') || 
                      '';

    // Try to extract caller name and service from variables or transcript
    const variables = callData.variables || {};
    const callerName = variables.customer_name || 
                       variables.name || 
                       extractNameFromTranscript(transcript) || 
                       'Unknown';
    const serviceRequested = variables.service || 
                            variables.service_type || 
                            extractServiceFromTranscript(transcript) || 
                            'General inquiry';

    // Determine outcome
    let outcome = 'Info Request';
    if (transcript.toLowerCase().includes('scheduled') || 
        transcript.toLowerCase().includes('appointment') ||
        variables.appointment_booked) {
      outcome = 'Appointment Booked';
    } else if (duration < 10) {
      outcome = 'Hang Up';
    }

    console.log('Extracted data:', { callerName, serviceRequested, outcome });

    // Insert call into database
    const { data: call, error: callError } = await supabase
      .from('calls')
      .insert({
        business_id,
        caller_phone: callerPhone,
        caller_name: callerName,
        start_time: new Date(callData.started_at || Date.now()).toISOString(),
        end_time: new Date(callData.ended_at || Date.now()).toISOString(),
        duration_seconds: duration,
        outcome,
        service_requested: serviceRequested,
        recording_url: recordingUrl,
        transcript,
      })
      .select()
      .single();

    if (callError) {
      console.error('Error inserting call:', callError);
      return res.status(500).json({ error: 'Failed to save call', details: callError });
    }

    console.log('Call saved:', call.id);

    // If appointment was booked, create appointment record
    if (outcome === 'Appointment Booked') {
      const appointmentDate = variables.appointment_date || getTomorrow();
      const appointmentTime = variables.appointment_time || '09:00';

      const { error: aptError } = await supabase
        .from('appointments')
        .insert({
          call_id: call.id,
          business_id,
          customer_name: callerName,
          customer_phone: callerPhone,
          service_type: serviceRequested,
          scheduled_date: appointmentDate,
          scheduled_time: appointmentTime,
          status: 'Scheduled',
          notes: `Booked via AI agent. ${transcript.substring(0, 200)}`,
        });

      if (aptError) {
        console.error('Error creating appointment:', aptError);
      } else {
        console.log('Appointment created');
      }
    }

    console.log('=== WEBHOOK PROCESSED SUCCESSFULLY ===');

    return res.status(200).json({ received: true, call_id: call.id });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
  }
}

// Helper functions
function extractNameFromTranscript(transcript: string): string | null {
  const nameMatch = transcript.match(/(?:my name is|this is|I'm) ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i);
  return nameMatch ? nameMatch[1] : null;
}

function extractServiceFromTranscript(transcript: string): string | null {
  const lower = transcript.toLowerCase();
  if (lower.includes('emergency') || lower.includes('backup') || lower.includes('overflow')) {
    return 'Emergency Pumping';
  }
  if (lower.includes('routine') || lower.includes('regular') || lower.includes('maintenance')) {
    return 'Routine Pumping';
  }
  if (lower.includes('inspection') || lower.includes('check')) {
    return 'Septic Inspection';
  }
  if (lower.includes('drain field') || lower.includes('soggy')) {
    return 'Drain Field Repair';
  }
  if (lower.includes('new system') || lower.includes('installation')) {
    return 'System Installation';
  }
  return null;
}

function getTomorrow(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}