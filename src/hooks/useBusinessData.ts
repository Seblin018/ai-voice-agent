import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Business {
  id: string;
  name: string;
  industry: string;
  avg_job_value: number;
  created_at: string;
}

interface Call {
  id: string;
  business_id: string;
  caller_phone: string;
  caller_name?: string;
  duration_seconds: number;
  outcome: 'appointment_booked' | 'info_request' | 'hang_up' | 'no_answer' | 'failed';
  service_requested: string;
  notes: string;
  recording_url?: string;
  transcript?: string;
  created_at: string;
}

interface Appointment {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  service_type: string;
  scheduled_date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  estimated_value: number;
  created_at: string;
}

interface DashboardMetrics {
  totalCalls: number;
  appointmentsBooked: number;
  estimatedRevenue: number;
  avgJobValue: number;
  businessName: string;
  calls: Call[];
  appointments: Appointment[];
}

export function useBusinessData() {
  const { user } = useAuth();

  const {
    data: business,
    isLoading: businessLoading,
    error: businessError
  } = useQuery({
    queryKey: ['business', user?.id],
    queryFn: async (): Promise<Business | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching business:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id
  });

  const {
    data: calls,
    isLoading: callsLoading,
    error: callsError
  } = useQuery({
    queryKey: ['calls', business?.id],
    queryFn: async (): Promise<Call[]> => {
      if (!business?.id) return [];

      const { data, error } = await supabase
        .from('calls')
        .select(`
          id,
          business_id,
          caller_phone,
          caller_name,
          duration_seconds,
          outcome,
          service_requested,
          notes,
          recording_url,
          transcript,
          created_at
        `)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching calls:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!business?.id
  });

  const {
    data: appointments,
    isLoading: appointmentsLoading,
    error: appointmentsError
  } = useQuery({
    queryKey: ['appointments', business?.id],
    queryFn: async (): Promise<Appointment[]> => {
      if (!business?.id) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!business?.id
  });

  const isLoading = businessLoading || callsLoading || appointmentsLoading;
  const error = businessError || callsError || appointmentsError;

  // Calculate metrics
  const metrics: DashboardMetrics | null = business ? {
    totalCalls: calls?.length || 0,
    appointmentsBooked: appointments?.filter(apt => apt.status === 'scheduled').length || 0,
    estimatedRevenue: (appointments?.filter(apt => apt.status === 'scheduled').length || 0) * business.avg_job_value,
    avgJobValue: business.avg_job_value,
    businessName: business.name,
    calls: calls || [],
    appointments: appointments || []
  } : null;

  return {
    business,
    calls,
    appointments,
    metrics,
    isLoading,
    error
  };
}
