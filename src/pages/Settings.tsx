import { useState } from 'react';
import { 
  Building2, 
  Wrench, 
  Brain, 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Check,
  Crown,
  Lock
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

interface Service {
  id: number;
  name: string;
  priceRange: string;
  duration: number;
  urgency: 'Emergency' | 'Same Day' | 'Flexible';
}

interface QA {
  id: number;
  question: string;
  answer: string;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('business');
  const [showAddService, setShowAddService] = useState(false);
  const [showAddQA, setShowAddQA] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Business Profile State
  const [businessProfile, setBusinessProfile] = useState({
    name: 'Reliable Septic Services',
    phone: '(555) 123-4567',
    address: '123 Main Street, Anytown, ST 12345',
    industry: 'Septic Services',
    openTime: '08:00',
    closeTime: '17:00',
    timezone: 'America/New_York'
  });

  // Services State
  const [services, setServices] = useState<Service[]>([
    { id: 1, name: 'Emergency Pumping', priceRange: '$400-600', duration: 60, urgency: 'Emergency' },
    { id: 2, name: 'Routine Pumping', priceRange: '$250-400', duration: 45, urgency: 'Flexible' },
    { id: 3, name: 'Septic Inspection', priceRange: '$150-250', duration: 30, urgency: 'Same Day' },
    { id: 4, name: 'Drain Field Repair', priceRange: '$800-1500', duration: 120, urgency: 'Emergency' },
    { id: 5, name: 'System Installation', priceRange: '$3000-8000', duration: 240, urgency: 'Flexible' }
  ]);

  const [newService, setNewService] = useState({
    name: '',
    priceRange: '',
    duration: 30,
    urgency: 'Flexible' as 'Emergency' | 'Same Day' | 'Flexible'
  });

  // AI Training State
  const [qaList, setQaList] = useState<QA[]>([
    { id: 1, question: 'How much does septic pumping cost?', answer: 'Our septic pumping services range from $250-600 depending on tank size and location.' },
    { id: 2, question: 'Do you offer emergency services?', answer: 'Yes, we provide 24/7 emergency septic services for urgent situations.' },
    { id: 3, question: 'How often should I pump my septic tank?', answer: 'We recommend pumping every 3-5 years, but it depends on household size and usage.' }
  ]);

  const [newQA, setNewQA] = useState({ question: '', answer: '' });
  const [pricingGuidelines] = useState('Our pricing is competitive and based on the scope of work required. Emergency services may include additional fees for after-hours calls.');
  const [bookingRules] = useState({
    minNotice: 'Same day',
    blackoutDates: '',
    askBudget: true,
    askLocation: true,
    askUrgency: true,
    askTimeline: true
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    email: {
      newAppointment: true,
      missedCall: true,
      dailySummary: false,
      weeklyReport: true,
      addresses: ['contact@reliableseptic.com']
    },
    sms: {
      emergencyOnly: true,
      allAppointments: false,
      systemAlerts: true,
      numbers: ['(555) 123-4567']
    }
  });

  const tabs = [
    { id: 'business', label: 'Business Profile', icon: Building2 },
    { id: 'services', label: 'Service Catalog', icon: Wrench },
    { id: 'training', label: 'AI Training', icon: Brain, isEnterprise: true },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const handleSave = () => {
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const addService = () => {
    if (newService.name && newService.priceRange) {
      const service: Service = {
        id: services.length + 1,
        ...newService
      };
      setServices([...services, service]);
      setNewService({ name: '', priceRange: '', duration: 30, urgency: 'Flexible' });
      setShowAddService(false);
    }
  };

  const deleteService = (id: number) => {
    setServices(services.filter(service => service.id !== id));
  };

  const addQA = () => {
    if (newQA.question && newQA.answer) {
      const qa: QA = {
        id: qaList.length + 1,
        ...newQA
      };
      setQaList([...qaList, qa]);
      setNewQA({ question: '', answer: '' });
      setShowAddQA(false);
    }
  };


  const addEmail = () => {
    setNotifications({
      ...notifications,
      email: {
        ...notifications.email,
        addresses: [...notifications.email.addresses, '']
      }
    });
  };

  const addSMS = () => {
    setNotifications({
      ...notifications,
      sms: {
        ...notifications.sms,
        numbers: [...notifications.sms.numbers, '']
      }
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Settings"
          description="Manage your business profile, services, AI training, and notifications"
          breadcrumbs={[
            { label: 'Settings' }
          ]}
        />

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm relative ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.isEnterprise && (
                    <div className="flex items-center gap-1">
                      <Crown className="h-3 w-3 text-amber-500" />
                      <span className="text-xs text-amber-600 font-medium">Enterprise</span>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
          {/* Business Profile Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={businessProfile.name}
                    onChange={(e) => setBusinessProfile({...businessProfile, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone</label>
                  <input
                    type="tel"
                    value={businessProfile.phone}
                    onChange={(e) => setBusinessProfile({...businessProfile, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                  <textarea
                    value={businessProfile.address}
                    onChange={(e) => setBusinessProfile({...businessProfile, address: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    value={businessProfile.industry}
                    onChange={(e) => setBusinessProfile({...businessProfile, industry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Septic Services">Septic Services</option>
                    <option value="Garage Doors">Garage Doors</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={businessProfile.timezone}
                    onChange={(e) => setBusinessProfile({...businessProfile, timezone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours - Open</label>
                  <input
                    type="time"
                    value={businessProfile.openTime}
                    onChange={(e) => setBusinessProfile({...businessProfile, openTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours - Close</label>
                  <input
                    type="time"
                    value={businessProfile.closeTime}
                    onChange={(e) => setBusinessProfile({...businessProfile, closeTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Service Catalog Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Service Catalog</h2>
                <button
                  onClick={() => setShowAddService(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add New Service
                </button>
              </div>
              
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{service.priceRange}</span>
                        <span>{service.duration} minutes</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.urgency === 'Emergency' ? 'bg-red-100 text-red-800' :
                          service.urgency === 'Same Day' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {service.urgency}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteService(service.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Training Tab */}
          {activeTab === 'training' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">AI Training</h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                  <Crown className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Enterprise Feature</span>
                </div>
              </div>
              
              {/* Enterprise Upgrade Prompt */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Lock className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Customize Your AI Script</h3>
                    <p className="text-gray-600 mb-4">
                      Unlock advanced AI training capabilities to customize your voice agent's responses, 
                      create custom Q&A pairs, and fine-tune pricing guidelines for your specific business needs.
                    </p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200">
                        <Crown className="h-4 w-4" />
                        Upgrade to Enterprise
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Common Questions & Answers */}
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Common Questions & Answers</h3>
                  <button
                    disabled
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Question
                  </button>
                </div>
                
                <div className="space-y-3">
                  {qaList.map((qa) => (
                    <div key={qa.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">Q: {qa.question}</p>
                          <p className="text-gray-600">A: {qa.answer}</p>
                        </div>
                        <button 
                          disabled
                          className="p-1 text-gray-300 cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Pricing Guidelines */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Guidelines</h3>
                <textarea
                  disabled
                  value={pricingGuidelines}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                  placeholder="Enter general pricing information for the AI to share with customers..."
                />
              </div>
              
              {/* Booking Rules */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Notice Required</label>
                    <select
                      disabled
                      value={bookingRules.minNotice}
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                    >
                      <option value="Immediate">Immediate</option>
                      <option value="2 hours">2 hours</option>
                      <option value="Same day">Same day</option>
                      <option value="Next day">Next day</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blackout Dates</label>
                    <input
                      type="date"
                      disabled
                      value={bookingRules.blackoutDates}
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Qualification Questions</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'askBudget', label: 'Ask about budget' },
                      { key: 'askLocation', label: 'Ask about location' },
                      { key: 'askUrgency', label: 'Ask about urgency' },
                      { key: 'askTimeline', label: 'Ask about timeline' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled
                          checked={bookingRules[item.key as keyof typeof bookingRules] as boolean}
                          className="h-4 w-4 text-gray-400 rounded cursor-not-allowed"
                        />
                        <span className="text-sm text-gray-500">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              
              {/* Email Notifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {[
                      { key: 'newAppointment', label: 'New appointment booked' },
                      { key: 'missedCall', label: 'Missed call' },
                      { key: 'dailySummary', label: 'Daily summary' },
                      { key: 'weeklyReport', label: 'Weekly report' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={notifications.email[item.key as keyof typeof notifications.email] as boolean}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            email: {...notifications.email, [item.key]: e.target.checked}
                          })}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Addresses</label>
                    <div className="space-y-2">
                      {notifications.email.addresses.map((email, index) => (
                        <input
                          key={index}
                          type="email"
                          value={email}
                          onChange={(e) => {
                            const newAddresses = [...notifications.email.addresses];
                            newAddresses[index] = e.target.value;
                            setNotifications({
                              ...notifications,
                              email: {...notifications.email, addresses: newAddresses}
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter email address"
                        />
                      ))}
                      <button
                        onClick={addEmail}
                        className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* SMS Notifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Notifications</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {[
                      { key: 'emergencyOnly', label: 'Emergency calls only' },
                      { key: 'allAppointments', label: 'All appointments' },
                      { key: 'systemAlerts', label: 'System alerts' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={notifications.sms[item.key as keyof typeof notifications.sms] as boolean}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            sms: {...notifications.sms, [item.key]: e.target.checked}
                          })}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Numbers</label>
                    <div className="space-y-2">
                      {notifications.sms.numbers.map((number, index) => (
                        <input
                          key={index}
                          type="tel"
                          value={number}
                          onChange={(e) => {
                            const newNumbers = [...notifications.sms.numbers];
                            newNumbers[index] = e.target.value;
                            setNotifications({
                              ...notifications,
                              sms: {...notifications.sms, numbers: newNumbers}
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter phone number"
                        />
                      ))}
                      <button
                        onClick={addSMS}
                        className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add Phone Number
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notification Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notification Preview</h4>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    📧 <strong>New Appointment:</strong> Emergency Pumping scheduled for tomorrow at 9:00 AM
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Sent to: contact@reliableseptic.com</p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Add Service Modal */}
        {showAddService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Service</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <input
                    type="text"
                    value={newService.priceRange}
                    onChange={(e) => setNewService({...newService, priceRange: e.target.value})}
                    placeholder="$X - $Y"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService({...newService, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
                  <select
                    value={newService.urgency}
                    onChange={(e) => setNewService({...newService, urgency: e.target.value as 'Emergency' | 'Same Day' | 'Flexible'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="Same Day">Same Day</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowAddService(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addService}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Service
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add QA Modal */}
        {showAddQA && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Question & Answer</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input
                    type="text"
                    value={newQA.question}
                    onChange={(e) => setNewQA({...newQA, question: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                  <textarea
                    value={newQA.answer}
                    onChange={(e) => setNewQA({...newQA, answer: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowAddQA(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addQA}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Q&A
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Success Toast */}
        {showSaveSuccess && (
          <div className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="h-5 w-5" />
            Settings saved successfully!
          </div>
        )}
      </div>
    </div>
  );
}
