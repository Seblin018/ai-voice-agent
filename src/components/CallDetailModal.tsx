import { useState } from 'react';
import { X, Phone, Clock, User, Calendar, FileText, Volume2, Play, Pause, Loader2 } from 'lucide-react';

interface CallDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: {
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
    created_at: string;
  } | null;
}

export default function CallDetailModal({ isOpen, onClose, call }: CallDetailModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !call) return null;

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

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getOutcomeBadgeColor = (outcome: string) => {
    switch (outcome) {
      case 'Appointment Booked':
      case 'appointment_booked':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Info Request':
      case 'info_request':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Hang Up':
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Call Details</h2>
                <p className="text-sm text-gray-500">{formatDateTime(call.start_time)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Call Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Caller Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Caller</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {call.caller_name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-600">{call.caller_phone}</p>
              </div>

              {/* Duration */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Duration</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDuration(call.duration_seconds)}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(call.start_time).toLocaleTimeString()} - {new Date(call.end_time).toLocaleTimeString()}
                </p>
              </div>

              {/* Outcome */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Outcome</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border ${getOutcomeBadgeColor(call.outcome)}`}>
                  {formatOutcome(call.outcome)}
                </span>
              </div>
            </div>

            {/* Service Requested */}
            {call.service_requested && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Service Requested</h3>
                <p className="text-gray-900">{call.service_requested}</p>
              </div>
            )}

            {/* Audio Player */}
            {call.recording_url && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Volume2 className="h-5 w-5 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-700">Call Recording</h3>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    disabled={isLoading}
                    className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500">{formatTime(currentTime)}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-600 rounded-full transition-all duration-200"
                          style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
                
                <audio
                  src={call.recording_url}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onLoadStart={() => setIsLoading(true)}
                  onCanPlay={() => setIsLoading(false)}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}

            {/* Transcript */}
            {call.transcript && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-700">Call Transcript</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {call.transcript}
                  </p>
                </div>
              </div>
            )}

            {/* Appointment Details */}
            {call.outcome === 'Appointment Booked' || call.outcome === 'appointment_booked' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <h3 className="text-sm font-medium text-green-800">Appointment Booked</h3>
                </div>
                <p className="text-sm text-green-700">
                  An appointment was successfully scheduled during this call. 
                  Check your appointments section for full details.
                </p>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
