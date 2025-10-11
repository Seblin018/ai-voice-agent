import { 
  CreditCard, 
  Download, 
  Calendar,
  CheckCircle, 
  XCircle, 
  ArrowUpRight,
  Phone,
  Clock,
  Building2,
  Headphones,
  BarChart3
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
}

export default function Billing() {
  const currentPlan = {
    name: 'Professional Plan',
    price: 299,
    status: 'Active',
    nextBilling: 'Nov 8, 2025'
  };

  const usage = {
    callsHandled: 127,
    callsLimit: 300,
    appointmentsBooked: 48,
    aiActiveHours: 380
  };

  const paymentMethod = {
    type: 'Visa',
    lastFour: '4242',
    expiry: '12/2027'
  };

  const invoices: Invoice[] = [
    { id: 'INV-001', date: '2024-10-08', description: 'Professional Plan - October 2024', amount: 299, status: 'Paid' },
    { id: 'INV-002', date: '2024-09-08', description: 'Professional Plan - September 2024', amount: 299, status: 'Paid' },
    { id: 'INV-003', date: '2024-08-08', description: 'Professional Plan - August 2024', amount: 299, status: 'Paid' },
    { id: 'INV-004', date: '2024-07-08', description: 'Professional Plan - July 2024', amount: 299, status: 'Paid' },
    { id: 'INV-005', date: '2024-06-08', description: 'Professional Plan - June 2024', amount: 299, status: 'Paid' },
    { id: 'INV-006', date: '2024-05-08', description: 'Professional Plan - May 2024', amount: 299, status: 'Paid' }
  ];

  const plans = [
    {
      name: 'Professional',
      price: 299,
      current: true,
      features: [
        { name: '300 calls/month', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority support', included: true },
        { name: 'Calendar integration', included: true },
        { name: 'Multi-location support', included: false },
        { name: 'Custom AI training', included: false }
      ]
    },
    {
      name: 'Enterprise',
      price: 499,
      current: false,
      features: [
        { name: 'Unlimited calls', included: true },
        { name: 'Everything in Professional', included: true },
        { name: 'Multi-location support', included: true },
        { name: 'Custom AI training', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'SLA guarantee', included: true }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CheckCircle className="h-4 w-4" />;
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Billing & Subscription"
          description="Manage your subscription, view usage, and billing history"
          breadcrumbs={[
            { label: 'Billing' }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Current Plan & Usage */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Plan */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  {currentPlan.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{currentPlan.name}</h3>
                  <p className="text-3xl font-bold text-blue-600">${currentPlan.price}<span className="text-lg font-normal text-gray-500">/month</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Next billing date</p>
                  <p className="text-lg font-semibold text-gray-900">{currentPlan.nextBilling}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  <ArrowUpRight className="h-4 w-4" />
                  Upgrade Plan
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  Cancel Subscription
                </button>
              </div>
            </div>

            {/* Usage This Month */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage This Month</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{usage.callsHandled}</p>
                  <p className="text-sm text-gray-600">Calls Handled</p>
                  <p className="text-xs text-gray-500 mt-1">/ {usage.callsLimit}</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(usage.callsHandled / usage.callsLimit) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((usage.callsHandled / usage.callsLimit) * 100)}% used
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{usage.appointmentsBooked}</p>
                  <p className="text-sm text-gray-600">Appointments Booked</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{usage.aiActiveHours}</p>
                  <p className="text-sm text-gray-600">AI Active Hours</p>
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing History</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{new Date(invoice.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{invoice.description}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">${invoice.amount}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Method & Plan Comparison */}
          <div className="space-y-8">
            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{paymentMethod.type} •••• {paymentMethod.lastFour}</p>
                  <p className="text-sm text-gray-500">Expires {paymentMethod.expiry}</p>
                </div>
              </div>
              
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                Update Payment Method
              </button>
            </div>

            {/* Plan Comparison */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Plan Comparison</h2>
              
              <div className="space-y-6">
                {plans.map((plan) => (
                  <div key={plan.name} className={`relative p-6 rounded-lg border-2 ${
                    plan.current 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    {plan.current && (
                      <div className="absolute -top-3 left-6">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Current Plan
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{plan.name}</h3>
                        <p className="text-gray-600 text-sm">
                          {plan.name === 'Professional' ? 'Perfect for growing businesses' : 'Advanced features for enterprise needs'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">${plan.price}</p>
                        <p className="text-sm text-gray-500">/month</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {feature.included ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {!plan.current && (
                      <button className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        plan.name === 'Enterprise'
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}>
                        Upgrade to {plan.name}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Usage Analytics</p>
                    <p className="text-sm text-gray-500">View detailed usage reports</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <Headphones className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Contact Support</p>
                    <p className="text-sm text-gray-500">Get help with billing questions</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Enterprise Features</p>
                    <p className="text-sm text-gray-500">Learn about advanced features</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
