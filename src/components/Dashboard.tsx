import { CheckCircle, DollarSign, TrendingUp, Clock, Phone, Calendar as CalendarIcon, Shield, ArrowRight, BarChart3, Settings, Users, Plus, Crown, Building2, Loader2, Play, Pause, Volume2, FileText, X, AlertCircle } from 'lucide-react';
import PageHeader from './PageHeader';
import EmptyState from './EmptyState';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  data?: any;
}

interface Call {
  id: string;
  caller_phone: string;
  caller_name?: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  outcome: string;
  service_requested?: string;
  recording_url?: string;
  transcript?: string;
  notes?: string;
  created_at: string;
}

interface Metrics {
  businessName: string;
  totalCalls: number;
  appointmentsBooked: number;
  estimatedRevenue: number;
  calls: Call[];
  ai_enabled?: boolean;
  bland_agent_id?: string;
  ai_phone_number?: string;
}

// Success Toast Component
function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg z-40 max-w-sm">
      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
      <p className="text-green-800 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-green-600 hover:text-green-700 ml-auto"
      >
        <X size={18} />
      </button>
    </div>
  );
}

// AI Agent Status Component
function AIAgentStatus({ isActive }: { isActive: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-gray-100 text-gray-600 border border-gray-200'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isActive 
          ? 'bg-green-500 animate-pulse' 
          : 'bg-gray-400'
      }`} />
      <span>AI Agent: {isActive ? 'Active' : 'Inactive'}</span>
    </div>
  );
}

// Audio Player Component
function AudioPlayer({ recordingUrl }: { recordingUrl: string; callId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </button>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Volume2 className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Call Recording</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
          <div className="flex-1 h-1 bg-gray-200 rounded-full">
            <div 
              className="h-1 bg-blue-600 rounded-full transition-all duration-200"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs text-gray-500">{formatTime(duration)}</span>
        </div>
      </div>
      
      <audio
        src={recordingUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}

// Transcript Viewer Component
function TranscriptViewer({ transcript }: { transcript: string; callId: string }) {
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  const truncatedTranscript = transcript.length > 200 ? transcript.substring(0, 200) + '...' : transcript;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Call Transcript</span>
        <button
          onClick={() => setShowFullTranscript(!showFullTranscript)}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          {showFullTranscript ? 'Show Less' : 'Show Full'}
        </button>
      </div>
      
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700 leading-relaxed">
          {showFullTranscript ? transcript : truncatedTranscript}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard({ data: _data }: DashboardProps) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get user's business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (businessError) {
        throw new Error('Failed to fetch business data');
      }

      // Get all calls for this business
      const { data: calls, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .eq('business_id', business.id)
        .order('start_time', { ascending: false });

      if (callsError) {
        throw new Error('Failed to fetch calls data');
      }

      // Calculate metrics
      const totalCalls = calls?.length || 0;
      const appointmentsBooked = calls?.filter(call => 
        call.outcome === 'Appointment Booked' || call.outcome === 'appointment_booked'
      ).length || 0;
      const estimatedRevenue = appointmentsBooked * (business.avg_job_value || 0);

      setMetrics({
        businessName: business.name,
        totalCalls,
        appointmentsBooked,
        estimatedRevenue,
        calls: calls || [],
        ai_enabled: business.ai_enabled,
        bland_agent_id: business.bland_agent_id,
        ai_phone_number: business.ai_phone_number,
      });

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Wizard functionality will be added later

  const handleAddCall = () => {
    console.log("Add new call clicked");
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOutcomeBadgeColor = (outcome: string) => {
    switch (outcome) {
      case 'appointment_booked':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'info_request':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'hang_up':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatOutcome = (outcome: string) => {
    switch (outcome) {
      case 'appointment_booked':
        return 'Appointment Booked';
      case 'info_request':
        return 'Info Request';
      case 'hang_up':
        return 'Hang Up';
      default:
        return outcome;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <EmptyState
            icon={BarChart3}
            title="Unable to Load Dashboard"
            description="There was an error loading your dashboard data. Please try refreshing the page."
            action={{
              label: 'Refresh Page',
              onClick: () => window.location.reload(),
              icon: <ArrowRight className="h-4 w-4" />
            }}
          />
        </div>
      </div>
    );
  }

  // No data state
  if (!metrics || (metrics.totalCalls === 0 && !metrics.ai_enabled)) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title={metrics?.businessName || "Your Business"}
            description="AI Voice Agent Dashboard"
            breadcrumbs={[
              { label: 'Dashboard' }
            ]}
            statusIndicator={<AIAgentStatus isActive={metrics?.ai_enabled || false} />}
            action={{
              label: 'Set Up AI Agent',
              onClick: () => console.log('Setup AI Agent clicked'),
              icon: <Plus className="h-4 w-4" />,
              variant: 'primary'
            }}
          />
          
          {showSuccess && (
            <SuccessToast
              message="AI agent configured successfully! 🎉"
              onClose={() => setShowSuccess(false)}
            />
          )}

          {metrics?.ai_enabled && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">AI Agent Active</h3>
                  <p className="text-blue-800 text-sm mb-3">
                    Your AI agent is now active! Start forwarding your calls to begin capturing business.
                  </p>
                  {metrics.ai_phone_number && (
                    <div className="text-sm bg-white rounded p-2 font-mono text-blue-600">
                      Forward to: {metrics.ai_phone_number}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8">
            <EmptyState
              icon={Phone}
              title={metrics?.ai_enabled ? "No calls yet" : "Get Started with Your AI Agent"}
              description={metrics?.ai_enabled 
                ? "Forward your phone to activate! Your AI will start capturing calls once you set up call forwarding to your dedicated AI phone number."
                : "Set up your AI agent to start capturing calls automatically."
              }
              action={{
                label: metrics?.ai_enabled ? 'View Settings' : 'Set Up AI Agent',
                onClick: () => console.log('Setup/Settings clicked'),
                icon: <Settings className="h-4 w-4" />
              }}
            />
          </div>

          {/* AIAgentSetupWizard component will be added later */}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={metrics.businessName}
          description="AI Voice Agent Dashboard"
          breadcrumbs={[
            { label: 'Dashboard' }
          ]}
          statusIndicator={<AIAgentStatus isActive={metrics.ai_enabled || false} />}
          action={{
            label: 'Add Call',
            onClick: handleAddCall,
            icon: <Plus className="h-4 w-4" />,
            variant: 'primary'
          }}
        />

        {showSuccess && (
          <SuccessToast
            message="AI agent configured successfully! 🎉"
            onClose={() => setShowSuccess(false)}
          />
        )}

        <div className="space-y-8">
          {/* ROI Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">ROI Analysis</h2>
              <DollarSign className="h-8 w-8" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <p className="text-blue-100 text-sm mb-2">Estimated Revenue Captured</p>
                <p className="text-4xl font-bold">${metrics.estimatedRevenue.toLocaleString()}</p>
              </div>
              
              <div className="text-center">
                <p className="text-blue-100 text-sm mb-2">Monthly Investment</p>
                <p className="text-4xl font-bold">$299</p>
              </div>
              
              <div className="text-center">
                <p className="text-blue-100 text-sm mb-2">ROI</p>
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <p className="text-4xl font-bold">
                    {metrics.estimatedRevenue > 0 ? Math.round(((metrics.estimatedRevenue - 299) / 299) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-blue-400">
              <p className="text-blue-100 text-center">
                <strong>Plain English:</strong> {metrics.estimatedRevenue > 0 
                  ? `For every $1 invested in our AI voice agent, we're capturing $${(metrics.estimatedRevenue / 299).toFixed(2)} in revenue. That's a return of over ${Math.round((metrics.estimatedRevenue - 299) / 299)}x your investment!`
                  : 'Start capturing calls to see your ROI analysis here.'
                }
              </p>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Calls */}
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+15%</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{metrics.totalCalls}</h3>
                <p className="text-gray-600 text-sm">Total Calls</p>
              </div>

              {/* Calls Answered */}
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>100%</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{metrics.totalCalls}</h3>
                <p className="text-gray-600 text-sm">Calls Answered (100% rate)</p>
              </div>

              {/* Appointments Booked */}
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>38%</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{metrics.appointmentsBooked}</h3>
                <p className="text-gray-600 text-sm">
                  Appointments Booked ({metrics.totalCalls > 0 ? Math.round((metrics.appointmentsBooked / metrics.totalCalls) * 100) : 0}% conversion)
                </p>
              </div>

              {/* Coverage Hours */}
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>24/7</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">24/7</h3>
                <p className="text-gray-600 text-sm">AI Coverage (Always Active)</p>
              </div>
            </div>
          </div>
          
          {/* Call Log Table */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Call Activity</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {metrics.calls.map((call) => (
                <div key={call.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  {/* Call Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatTime(call.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{call.caller_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {formatDuration(call.duration_seconds)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getOutcomeBadgeColor(call.outcome)}`}>
                        {formatOutcome(call.outcome)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Call Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Service Requested</h4>
                      <p className="text-sm text-gray-600">{call.service_requested || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Appointment Status</h4>
                      <p className="text-sm text-gray-600">
                        {call.outcome === 'appointment_booked' ? 'Scheduled' : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Audio Player and Transcript */}
                  <div className="space-y-4">
                    {call.recording_url && (
                      <AudioPlayer recordingUrl={call.recording_url} callId={call.id} />
                    )}
                    
                    {call.transcript && (
                      <TranscriptViewer transcript={call.transcript} callId={call.id} />
                    )}
                  </div>
                  
                  {/* Notes */}
                  {call.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600">{call.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Enterprise Upgrade Section */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-300 rounded-full mb-4">
                  <Crown className="h-5 w-5 text-amber-600" />
                  <span className="text-amber-800 font-semibold">Ready to Scale?</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Unlock Enterprise Features</h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  You're already seeing great results with Professional. Take your business to the next level 
                  with advanced AI customization and multi-location support.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-white rounded-lg border border-amber-100">
                  <div className="bg-amber-600 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Custom AI Training</h3>
                  <p className="text-gray-600 text-sm">
                    Train your AI with custom scripts, Q&A pairs, and business-specific responses.
                  </p>
                </div>
                
                <div className="text-center p-6 bg-white rounded-lg border border-amber-100">
                  <div className="bg-amber-600 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Multi-Location Support</h3>
                  <p className="text-gray-600 text-sm">
                    Manage multiple business locations with centralized AI voice agent control.
                  </p>
                </div>
                
                <div className="text-center p-6 bg-white rounded-lg border border-amber-100">
                  <div className="bg-amber-600 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Dedicated Support</h3>
                  <p className="text-gray-600 text-sm">
                    Get a dedicated account manager and priority support for your growing business.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-amber-200 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Enterprise Plan</h3>
                    <p className="text-gray-600">Everything in Professional, plus advanced features</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">$499</p>
                    <p className="text-sm text-gray-500">/month</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Unlimited calls</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Custom AI training</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Multi-location support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Dedicated account manager</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <button className="bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors duration-200 flex items-center gap-2 mx-auto mb-4">
                  <Crown className="h-5 w-5" />
                  Upgrade to Enterprise
                </button>
                <p className="text-gray-500 text-sm">
                  Contact our sales team to discuss your upgrade options
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AIAgentSetupWizard component will be added later */}
      </div>
    </div>
  );
}