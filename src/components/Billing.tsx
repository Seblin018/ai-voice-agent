import { CreditCard, Download, DollarSign, TrendingUp } from 'lucide-react';

export default function Billing() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Usage</h1>
          <p className="text-gray-600">Manage your subscription, view usage, and download invoices</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Plan */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Professional</h3>
                <p className="text-gray-600">$299/month</p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Next billing date</p>
                <p className="font-semibold text-gray-900">January 1, 2025</p>
              </div>
            </div>
          </div>

          {/* Usage This Month */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Usage This Month</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Calls Handled</span>
                <span className="font-semibold text-gray-900">21</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Appointments Booked</span>
                <span className="font-semibold text-gray-900">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue Captured</span>
                <span className="font-semibold text-green-600">$4,600</span>
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">ROI Summary</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Investment</span>
                <span className="font-semibold text-gray-900">$299</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Return</span>
                <span className="font-semibold text-green-600">$4,600</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">ROI</span>
                  <span className="font-bold text-green-600">1,439%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
              <Download className="h-4 w-4" />
              Download All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">Dec 1, 2024</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">Professional Plan - December</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">$299.00</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Paid
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">Nov 1, 2024</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">Professional Plan - November</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">$299.00</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Paid
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">Oct 1, 2024</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">Professional Plan - October</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">$299.00</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Paid
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/26</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
