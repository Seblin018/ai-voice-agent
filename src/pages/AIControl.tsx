import { useState, useEffect } from 'react';
import { 
  Bot, 
  Power, 
  Clock, 
  Phone, 
  AlertTriangle,
  CheckCircle,
  X,
  Calendar,
  Settings,
  Activity,
  Timer,
  Shield,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import CallForwardingInstructions from '../components/CallForwardingInstructions';
import { useAuth } from '../contexts/AuthContext';

interface BusinessData {
  id: string;
  name: string;
  bland_phone_number?: string;
  bland_agent_id?: string;
  ai_status: 'active' | 'inactive';
}

export default function AIControl() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTestCallModal, setShowTestCallModal] = useState(false);
  const [showForwardingModal, setShowForwardingModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load business data on component mount
  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        setIsLoading(true);
        // In a real app, you'd fetch from your API
        // For now, we'll simulate the data
        const mockBusiness: BusinessData = {
          id: 'business-123',
          name: 'Reliable Septic Services',
          bland_phone_number: undefined, // No phone number yet
          bland_agent_id: undefined,
          ai_status: 'inactive'
        };
        setBusiness(mockBusiness);
      } catch (err) {
        setError('Failed to load business data');
        console.error('Error loading business data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessData();
  }, []);

  const provisionPhoneNumber = async () => {
    try {
      setIsProvisioning(true);
      setError(null);
      
      const response = await fetch('/api/provision-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: business?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to provision phone number');
      }

      const data = await response.json();
      
      // Update business data with new phone number
      setBusiness(prev => prev ? {
        ...prev,
        bland_phone_number: data.phone_number,
        bland_agent_id: data.agent_id,
        ai_status: 'active'
      } : null);

    } catch (err) {
      setError('Failed to provision phone number. Please try again.');
      console.error('Error provisioning phone number:', err);
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleToggleAI = async () => {
    if (!business?.bland_agent_id) {
      setError('No AI agent found. Please provision a phone number first.');
      return;
    }

    if (business.ai_status === 'active') {
      setShowConfirmModal(true);
    } else {
      await toggleAIStatus('active');
    }
  };

  const confirmTurnOff = async () => {
    setShowConfirmModal(false);
    await toggleAIStatus('inactive');
  };

  const toggleAIStatus = async (newStatus: 'active' | 'inactive') => {
    try {
      setIsToggling(true);
      setError(null);

      const response = await fetch('/api/toggle-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: business?.id,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle AI agent');
      }

      // Update business status
      setBusiness(prev => prev ? {
        ...prev,
        ai_status: newStatus
      } : null);

    } catch (err) {
      setError('Failed to toggle AI agent. Please try again.');
      console.error('Error toggling AI agent:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const testCall = async () => {
    if (!business?.bland_phone_number) {
      setError('No phone number available for testing');
      return;
    }

    try {
      setShowTestCallModal(true);
      setError(null);
      
      // In a real implementation, you'd call a test API
      // For now, we'll simulate the test call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setShowTestCallModal(false);
      // You could show a success message here
      
    } catch (err) {
      setError('Test call failed. Please try again.');
      console.error('Error testing call:', err);
      setShowTestCallModal(false);
    }
  };

  const copyPhoneNumber = () => {
    if (business?.bland_phone_number) {
      navigator.clipboard.writeText(business.bland_phone_number);
      // You could show a toast notification here
    }
  };

  const scheduleData = [
    { day: 'Monday', hours: '6:00 PM - 8:00 AM', active: true },
    { day: 'Tuesday', hours: '6:00 PM - 8:00 AM', active: true },
    { day: 'Wednesday', hours: '6:00 PM - 8:00 AM', active: true },
    { day: 'Thursday', hours: '6:00 PM - 8:00 AM', active: true },
    { day: 'Friday', hours: '6:00 PM - 8:00 AM', active: true },
    { day: 'Saturday', hours: '24 hours', active: true },
    { day: 'Sunday', hours: '24 hours', active: true },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="AI Control Panel"
            description="Manage your AI voice agent settings and monitor performance"
            breadcrumbs={[
              { label: 'AI Control' }
            ]}
          />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading AI control panel...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No business data
  if (!business) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="AI Control Panel"
            description="Manage your AI voice agent settings and monitor performance"
            breadcrumbs={[
              { label: 'AI Control' }
            ]}
          />
          <EmptyState
            icon={AlertTriangle}
            title="Business Not Found"
            description="Unable to load business information. Please try refreshing the page."
            action={{
              label: 'Refresh Page',
              onClick: () => window.location.reload(),
              icon: <ExternalLink className="h-4 w-4" />
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="AI Control Panel"
          description="Manage your AI voice agent settings and monitor performance"
          breadcrumbs={[
            { label: 'AI Control' }
          ]}
        />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* No Phone Number - Show Activation */}
        {!business.bland_phone_number && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="text-center">
              <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Activate Your AI Agent</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Get your dedicated AI phone number and start handling calls automatically. 
                Your AI agent will answer calls, collect information, and book appointments 24/7.
              </p>
              
              <button
                onClick={provisionPhoneNumber}
                disabled={isProvisioning}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isProvisioning ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Activating AI Agent...
                  </>
                ) : (
                  <>
                    <Power className="h-5 w-5" />
                    Activate AI Agent
                  </>
                )}
              </button>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• We'll provision a dedicated phone number for your business</li>
                  <li>• Create an AI agent trained for your industry</li>
                  <li>• Set up call forwarding instructions</li>
                  <li>• Your AI will be ready to handle calls immediately</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Has Phone Number - Show Control Panel */}
        {business.bland_phone_number && (
          <>
            {/* Master On/Off Toggle */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Bot className={`h-12 w-12 ${business.ai_status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Voice Agent</h2>
                    <p className={`text-lg font-semibold ${business.ai_status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      AI is currently: {business.ai_status === 'active' ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleToggleAI}
                  disabled={isToggling}
                  className={`relative inline-flex h-16 w-32 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                    business.ai_status === 'active'
                      ? 'bg-green-600 focus:ring-green-300' 
                      : 'bg-red-600 focus:ring-red-300'
                  }`}
                >
                  <span
                    className={`inline-block h-12 w-12 transform rounded-full bg-white transition-transform duration-200 flex items-center justify-center ${
                      business.ai_status === 'active' ? 'translate-x-16' : 'translate-x-2'
                    }`}
                  >
                    {isToggling ? (
                      <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                    ) : (
                      <Power className={`h-6 w-6 ${business.ai_status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                    )}
                  </span>
                </button>
                
                <p className="mt-4 text-sm text-gray-500">
                  {business.ai_status === 'active' ? 'Click to turn off AI agent' : 'Click to turn on AI agent'}
                </p>
              </div>
            </div>

            {/* Phone Number Display */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
              <div className="text-center">
                <Phone className="h-12 w-12 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your AI Phone Number</h2>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-3xl font-bold">{business.bland_phone_number}</span>
                  <button
                    onClick={copyPhoneNumber}
                    className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors duration-200"
                    title="Copy phone number"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-blue-100 mb-6">
                  Forward your business calls to this number to activate your AI agent
                </p>
                <button
                  onClick={() => setShowForwardingModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
                >
                  <Settings className="h-5 w-5" />
                  Setup Call Forwarding
                </button>
              </div>
            </div>
          </>
        )}

        {/* Show control panel only if phone number exists */}
        {business.bland_phone_number && (
          <>
            {/* AI Status - Show Empty State if Inactive */}
            {business.ai_status === 'inactive' && (
              <EmptyState
                icon={Bot}
                title="AI Agent is Inactive"
                description="Your AI voice agent is currently turned off. Turn it back on to start handling calls automatically."
                action={{
                  label: 'Turn On AI Agent',
                  onClick: () => handleToggleAI(),
                  icon: <Power className="h-4 w-4" />
                }}
              />
            )}

            {/* Show Control Panel if Active */}
            {business.ai_status === 'active' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Schedule Settings */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-6 w-6 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Active Hours Schedule</h2>
                    </div>
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Edit Schedule
                    </button>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {scheduleData.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{day.day}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{day.hours}</span>
                          <div className={`w-2 h-2 rounded-full ${day.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Next scheduled change:</strong> Tomorrow at 8:00 AM
                    </p>
                  </div>
                </div>

                {/* Call Forwarding Setup */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Phone className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Call Forwarding Setup</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Dedicated AI Phone Number</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900">{business.bland_phone_number}</p>
                        <button
                          onClick={copyPhoneNumber}
                          className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                          title="Copy phone number"
                        >
                          <Copy className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">Setup Instructions:</h3>
                      <ol className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                          Call your phone carrier's customer service
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                          Request to forward calls to {business.bland_phone_number}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                          Set forwarding schedule to match your AI hours
                        </li>
                      </ol>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-800">Last test: Oct 8, 2:25 PM - Successful</span>
                      </div>
                      <button
                        onClick={testCall}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                      >
                        <Phone className="h-4 w-4" />
                        Test Call
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="h-6 w-6 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200">
                      <Timer className="h-5 w-5" />
                      Pause for 2 hours
                    </button>
                    
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200">
                      <Clock className="h-5 w-5" />
                      Pause until tomorrow morning
                    </button>
                    
                    <button 
                      onClick={() => handleToggleAI()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
                    >
                      <AlertTriangle className="h-5 w-5" />
                      Emergency Disable
                    </button>
                  </div>
                </div>

                {/* Status Overview */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Status Overview</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Last call handled</span>
                      <span className="font-semibold text-gray-900">2 minutes ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Uptime</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">99.9%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div className="w-full h-2 bg-green-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Avg response time</span>
                      <span className="font-semibold text-gray-900">&lt;1 second</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">System health</span>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">Excellent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to turn off the AI agent? This will stop all call handling and may result in missed calls.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmTurnOff}
                  disabled={isToggling}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isToggling ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Turning Off...
                    </div>
                  ) : (
                    'Turn Off'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Edit Schedule</h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                {scheduleData.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <span className="font-medium text-gray-900">{day.day}</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        defaultValue="18:00"
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        defaultValue="08:00"
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="checkbox"
                        defaultChecked={day.active}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Call Modal */}
        {showTestCallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Testing Call</h3>
                <p className="text-gray-600 mb-4">Calling {business?.bland_phone_number} to test your AI agent...</p>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>What to expect:</strong> Your AI agent should answer and ask how it can help you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call Forwarding Instructions Modal */}
        {showForwardingModal && business?.bland_phone_number && (
          <CallForwardingInstructions
            aiPhoneNumber={business.bland_phone_number}
            isOpen={showForwardingModal}
            onClose={() => setShowForwardingModal(false)}
            showAsModal={true}
          />
        )}
      </div>
    </div>
  );
}
