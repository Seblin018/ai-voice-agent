import { useState } from 'react';
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
  Shield
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

export default function AIControl() {
  const [isActive, setIsActive] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTestCallModal, setShowTestCallModal] = useState(false);

  const handleToggleAI = () => {
    if (isActive) {
      setShowConfirmModal(true);
    } else {
      setIsActive(true);
    }
  };

  const confirmTurnOff = () => {
    setIsActive(false);
    setShowConfirmModal(false);
  };

  const testCall = () => {
    setShowTestCallModal(true);
    // Simulate test call
    setTimeout(() => {
      setShowTestCallModal(false);
    }, 2000);
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

        {/* Master On/Off Toggle */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Bot className={`h-12 w-12 ${isActive ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Voice Agent</h2>
                <p className={`text-lg font-semibold ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                  AI is currently: {isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleToggleAI}
              className={`relative inline-flex h-16 w-32 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                isActive 
                  ? 'bg-green-600 focus:ring-green-300' 
                  : 'bg-red-600 focus:ring-red-300'
              }`}
            >
              <span
                className={`inline-block h-12 w-12 transform rounded-full bg-white transition-transform duration-200 flex items-center justify-center ${
                  isActive ? 'translate-x-16' : 'translate-x-2'
                }`}
              >
                <Power className={`h-6 w-6 ${isActive ? 'text-green-600' : 'text-red-600'}`} />
              </span>
            </button>
            
            <p className="mt-4 text-sm text-gray-500">
              {isActive ? 'Click to turn off AI agent' : 'Click to turn on AI agent'}
            </p>
          </div>
        </div>

        {!isActive ? (
          <EmptyState
            icon={Bot}
            title="AI Agent is Inactive"
            description="Your AI voice agent is currently turned off. Turn it back on to start handling calls automatically."
            action={{
              label: 'Turn On AI Agent',
              onClick: () => setIsActive(true),
              icon: <Power className="h-4 w-4" />
            }}
          />
        ) : (
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
                <p className="text-2xl font-bold text-gray-900">(555) 123-4567</p>
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
                    Request to forward calls to (555) 123-4567
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
              
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold">
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
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Turn Off
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
                <p className="text-gray-600">Please wait while we test the call forwarding...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
