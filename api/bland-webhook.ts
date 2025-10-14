import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BlandWebhookPayload {
  call_id: string;
  from: string; // caller phone
  to: string; // business phone
  duration: number; // in seconds
  recording_url?: string;
  transcript?: string;
  concatenated_transcript?: string;
  variables?: {
    caller_name?: string;
    service_requested?: string;
    urgency?: string;
    appointment_date?: string;
    appointment_time?: string;
    property_address?: string;
    problem_description?: string;
    [key: string]: any;
  };
  status?: 'completed' | 'failed' | 'no-answer';
}

interface CallRecord {
  business_id: string;
  caller_phone: string;
  caller_name?: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  outcome: 'appointment_booked' | 'info_request' | 'hang_up' | 'no_answer';
  service_requested?: string;
  recording_url?: string;
  transcript?: string;
  created_at: string;
}

interface AppointmentRecord {
  business_id: string;
  caller_phone: string;
  caller_name?: string;
  service_requested?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  property_address?: string;
  problem_description?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled';
  created_at: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract business_id from query params
    const businessId = req.query.business_id as string;
    
    if (!businessId) {
      console.error('Missing business_id in query params');
      return res.status(400).json({ error: 'Missing business_id parameter' });
    }

    console.log('Received Bland webhook for business:', businessId);
    console.log('Webhook payload:', JSON.stringify(req.body, null, 2));

    const payload: BlandWebhookPayload = req.body;

    // Validate required fields
    if (!payload.call_id || !payload.from || !payload.to) {
      console.error('Missing required fields in webhook payload');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Parse call data
    const callerPhone = payload.from;
    const businessPhone = payload.to;
    const duration = payload.duration || 0;
    const recordingUrl = payload.recording_url;
    const transcript = payload.concatenated_transcript || payload.transcript || '';
    const variables = payload.variables || {};

    // Extract caller information
    const callerName = variables.caller_name;
    const serviceRequested = variables.service_requested;
    const urgency = variables.urgency;
    const appointmentDate = variables.appointment_date;
    const appointmentTime = variables.appointment_time;
    const propertyAddress = variables.property_address;
    const problemDescription = variables.problem_description;

    // Determine call outcome
    let outcome: CallRecord['outcome'] = 'hang_up';
    
    if (payload.status === 'no-answer') {
      outcome = 'no_answer';
    } else if (payload.status === 'failed') {
      outcome = 'hang_up';
    } else if (payload.status === 'completed') {
      // Check if appointment was booked
      const hasAppointment = appointmentDate && appointmentTime;
      const hasAppointmentKeywords = transcript.toLowerCase().includes('appointment') || 
                                   transcript.toLowerCase().includes('schedule') ||
                                   transcript.toLowerCase().includes('book');
      
      if (hasAppointment || hasAppointmentKeywords) {
        outcome = 'appointment_booked';
      } else if (transcript.length > 50) {
        outcome = 'info_request';
      } else {
        outcome = 'hang_up';
      }
    }

    // Calculate start and end times
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (duration * 1000));

    // Create call record
    const callRecord: CallRecord = {
      business_id: businessId,
      caller_phone: callerPhone,
      caller_name: callerName,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_seconds: duration,
      outcome: outcome,
      service_requested: serviceRequested,
      recording_url: recordingUrl,
      transcript: transcript,
      created_at: new Date().toISOString()
    };

    console.log('Creating call record:', callRecord);

    // Insert call record into Supabase
    const { data: callData, error: callError } = await supabase
      .from('calls')
      .insert(callRecord)
      .select()
      .single();

    if (callError) {
      console.error('Error creating call record:', callError);
      return res.status(500).json({ error: 'Failed to save call record' });
    }

    console.log('Call record created successfully:', callData.id);

    // If appointment was booked, create appointment record
    if (outcome === 'appointment_booked' && (appointmentDate || appointmentTime)) {
      const appointmentRecord: AppointmentRecord = {
        business_id: businessId,
        caller_phone: callerPhone,
        caller_name: callerName,
        service_requested: serviceRequested,
        scheduled_date: appointmentDate,
        scheduled_time: appointmentTime,
        property_address: propertyAddress,
        problem_description: problemDescription,
        status: 'scheduled',
        created_at: new Date().toISOString()
      };

      console.log('Creating appointment record:', appointmentRecord);

      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert(appointmentRecord)
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment record:', appointmentError);
        // Don't fail the webhook, just log the error
      } else {
        console.log('Appointment record created successfully:', appointmentData.id);
      }
    }

    // Send SMS notification to business owner
    try {
      await sendSMSNotification(businessId, {
        callerName: callerName || 'Unknown',
        service: serviceRequested || 'General inquiry',
        urgency: urgency || 'Standard',
        outcome: outcome
      });
    } catch (smsError) {
      console.error('Error sending SMS notification:', smsError);
      // Don't fail the webhook for SMS errors
    }

    // Log the webhook processing
    await supabase
      .from('ai_activity_log')
      .insert({
        business_id: businessId,
        action: 'call_received',
        details: `Call from ${callerPhone} - ${outcome} - ${serviceRequested || 'No service specified'}`,
        created_at: new Date().toISOString()
      });

    console.log('Webhook processed successfully for business:', businessId);

    return res.status(200).json({ 
      success: true, 
      call_id: callData.id,
      outcome: outcome,
      appointment_booked: outcome === 'appointment_booked'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to send SMS notification
async function sendSMSNotification(businessId: string, callInfo: {
  callerName: string;
  service: string;
  urgency: string;
  outcome: string;
}) {
  try {
    // Get business owner's phone number
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('phone, name')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      console.error('Business not found for SMS notification:', businessError);
      return;
    }

    const message = `New call from ${callInfo.callerName} - ${callInfo.service} - ${callInfo.urgency} urgency. Outcome: ${callInfo.outcome}`;
    
    // Here you would integrate with your SMS provider (Twilio, etc.)
    // For now, we'll just log the message
    console.log(`SMS to ${business.phone} (${business.name}): ${message}`);
    
    // TODO: Implement actual SMS sending
    // await sendSMS(business.phone, message);
    
  } catch (error) {
    console.error('Error in SMS notification:', error);
    throw error;
  }
}