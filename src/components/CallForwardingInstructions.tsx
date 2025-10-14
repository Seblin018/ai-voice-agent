import { useState } from 'react';
import { 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  ExternalLink,
  Copy,
  X,
  Smartphone,
  Settings,
  ArrowRight
} from 'lucide-react';

interface CallForwardingInstructionsProps {
  aiPhoneNumber: string;
  onClose?: () => void;
  showAsModal?: boolean;
}

interface Carrier {
  name: string;
  steps: string[];
  code: string;
  icon: string;
  color: string;
  additionalInfo?: string;
}

const carriers: Carrier[] = [
  {
    name: 'Verizon',
    steps: [
      'Dial *72 on your phone',
      'Enter your AI phone number',
      'Press the call button',
      'Wait for confirmation tone',
      'Hang up to complete setup'
    ],
    code: '*72 + AI number',
    icon: '📱',
    color: 'bg-red-50 border-red-200 text-red-800',
    additionalInfo: 'To disable: Dial *73'
  },
  {
    name: 'AT&T',
    steps: [
      'Dial *21* on your phone',
      'Enter your AI phone number',
      'Press # to confirm',
      'Press the call button',
      'Wait for confirmation message'
    ],
    code: '*21* + AI number + #',
    icon: '📞',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    additionalInfo: 'To disable: Dial #21#'
  },
  {
    name: 'T-Mobile',
    steps: [
      'Dial **21* on your phone',
      'Enter your AI phone number',
      'Press # to confirm',
      'Press the call button',
      'Wait for confirmation message'
    ],
    code: '**21* + AI number + #',
    icon: '📲',
    color: 'bg-pink-50 border-pink-200 text-pink-800',
    additionalInfo: 'To disable: Dial ##21#'
  },
  {
    name: 'Google Voice',
    steps: [
      'Open Google Voice app or website',
      'Go to Settings → Calls',
      'Find "Forward to" section',
      'Click "Add number"',
      'Enter your AI phone number',
      'Save the settings'
    ],
    code: 'Settings → Calls → Forward to',
    icon: '🎤',
    color: 'bg-green-50 border-green-200 text-green-800',
    additionalInfo: 'Works on both mobile and desktop'
  },
  {
    name: 'Sprint',
    steps: [
      'Dial *72 on your phone',
      'Enter your AI phone number',
      'Press the call button',
      'Wait for confirmation tone',
      'Hang up to complete setup'
    ],
    code: '*72 + AI number',
    icon: '📱',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    additionalInfo: 'To disable: Dial *73'
  },
  {
    name: 'Other Carriers',
    steps: [
      'Contact your carrier\'s customer service',
      'Ask about call forwarding setup',
      'Provide your AI phone number',
      'Request immediate forwarding',
      'Test the setup with a call'
    ],
    code: 'Contact carrier support',
    icon: '🏢',
    color: 'bg-gray-50 border-gray-200 text-gray-800',
    additionalInfo: 'Most carriers support *72 or *21* codes'
  }
];

export default function CallForwardingInstructions({ 
  aiPhoneNumber, 
  onClose, 
  showAsModal = false 
}: CallForwardingInstructionsProps) {
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(aiPhoneNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Phone className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Set Up Call Forwarding</h2>
            <p className="text-gray-600">Forward your business calls to your AI agent</p>
          </div>
        </div>
        
        {/* AI Phone Number Display */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-center gap-4">
            <Smartphone className="h-6 w-6" />
            <div>
              <p className="text-blue-100 text-sm mb-1">Your AI Phone Number</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{formatPhoneNumber(aiPhoneNumber)}</span>
                <button
                  onClick={copyPhoneNumber}
                  className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors duration-200"
                  title="Copy phone number"
                >
                  {copiedNumber ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carrier Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Carrier</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {carriers.map((carrier) => (
            <button
              key={carrier.name}
              onClick={() => setSelectedCarrier(selectedCarrier === carrier.name ? null : carrier.name)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedCarrier === carrier.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{carrier.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{carrier.name}</h4>
                  <p className="text-sm text-gray-600">{carrier.code}</p>
                </div>
                {selectedCarrier === carrier.name ? (
                  <ChevronUp className="h-5 w-5 text-blue-600 ml-auto" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Carrier Instructions */}
      {selectedCarrier && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {(() => {
            const carrier = carriers.find(c => c.name === selectedCarrier);
            if (!carrier) return null;

            return (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{carrier.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{carrier.name} Instructions</h3>
                    <p className="text-gray-600">Follow these steps to forward your calls</p>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4 mb-6">
                  {carrier.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{step}</p>
                        {index === 0 && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Dial this code:</p>
                            <code className="text-lg font-mono font-semibold text-blue-600">
                              {carrier.code.replace('+ AI number', `+ ${formatPhoneNumber(aiPhoneNumber)}`)}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Info */}
                {carrier.additionalInfo && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">Additional Info</span>
                    </div>
                    <p className="text-blue-800">{carrier.additionalInfo}</p>
                  </div>
                )}

                {/* Test Instructions */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">Test Your Setup</span>
                  </div>
                  <ol className="text-green-800 space-y-1">
                    <li>1. Call your business number from another phone</li>
                    <li>2. Your AI agent should answer automatically</li>
                    <li>3. If it doesn't work, try the steps again</li>
                    <li>4. Contact support if you need help</li>
                  </ol>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* General Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-4">💡 Pro Tips</h3>
        <ul className="space-y-2 text-amber-800">
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 mt-1 flex-shrink-0" />
            <span>Test your forwarding during business hours to ensure it works</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 mt-1 flex-shrink-0" />
            <span>Keep your original phone nearby in case you need to disable forwarding</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 mt-1 flex-shrink-0" />
            <span>Some carriers may charge for call forwarding - check with your provider</span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 mt-1 flex-shrink-0" />
            <span>Forwarding usually takes effect immediately after setup</span>
          </li>
        </ul>
      </div>

      {/* Support Link */}
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Need help? Our support team is here to assist you.
        </p>
        <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
          <ExternalLink className="h-4 w-4" />
          Contact Support
        </button>
      </div>
    </div>
  );

  if (showAsModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Call Forwarding Setup</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {content}
    </div>
  );
}
