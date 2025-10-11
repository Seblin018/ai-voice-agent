import { CheckCircle, DollarSign, TrendingUp, Clock, Phone, Calendar as CalendarIcon, Shield, ArrowRight, BarChart3, Settings, Users, Plus, Crown, Building2, Loader2 } from 'lucide-react';
import PageHeader from './PageHeader';
import { useBusinessData } from '../hooks/useBusinessData';
import EmptyState from './EmptyState';

interface DashboardProps {
  data?: any; // Keeping this for compatibility but we'll use our own data
}

export default function Dashboard({ data: _data }: DashboardProps) {
  const { metrics, isLoading, error } = useBusinessData();

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
  if (!metrics || metrics.totalCalls === 0) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title={metrics?.businessName || "Your Business"}
            description="AI Voice Agent Dashboard"
            breadcrumbs={[
              { label: 'Dashboard' }
            ]}
            action={{
              label: 'Activate AI Agent',
              onClick: () => console.log('Activate AI Agent'),
              icon: <Plus className="h-4 w-4" />,
              variant: 'primary'
            }}
          />
          
          <div className="mt-8">
            <EmptyState
              icon={Phone}
              title="No calls yet"
              description="Your AI will start capturing calls once activated. Set up your AI agent to begin tracking calls and appointments."
              action={{
                label: 'Set Up AI Agent',
                onClick: () => console.log('Set up AI agent'),
                icon: <Settings className="h-4 w-4" />
              }}
            />
          </div>
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
          action={{
            label: 'Add Call',
            onClick: handleAddCall,
            icon: <Plus className="h-4 w-4" />,
            variant: 'primary'
          }}
        />
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
              {/* After-Hours Calls */}
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
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outcome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Needed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.calls.map((call) => (
                    <tr key={call.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {formatTime(call.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {call.caller_phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(call.duration_seconds)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getOutcomeBadgeColor(call.outcome)}`}>
                          {formatOutcome(call.outcome)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {call.service_requested || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {call.outcome === 'appointment_booked' ? 'Scheduled' : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={call.notes}>
                          {call.notes || 'No notes'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
      </div>
    </div>
  );
}