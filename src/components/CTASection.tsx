import { ArrowRight, BarChart3, Settings, Users } from 'lucide-react';

export default function CTASection() {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Optimize Your AI Voice Agent</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Take your business to the next level with advanced AI voice solutions. 
            Get detailed analytics, customize responses, and scale your operations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="bg-blue-600 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-gray-300 text-sm">
              Deep insights into call patterns, conversion rates, and performance metrics.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-600 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Settings className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Custom Configuration</h3>
            <p className="text-gray-300 text-sm">
              Tailor your AI agent's responses and behavior to match your business needs.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-600 rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Management</h3>
            <p className="text-gray-300 text-sm">
              Manage multiple agents, assign roles, and track team performance.
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 mx-auto">
            Upgrade to Pro
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-gray-400 text-sm mt-4">
            Start your 14-day free trial • No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
