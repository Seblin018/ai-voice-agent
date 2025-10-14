import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const signUpSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'email-confirmation' | 'auto-confirmed' | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const password = watch('password', '');

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('=== SIGNUP FLOW START ===');
      console.log('Step 1: Signing up user...');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            business_name: data.businessName
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (signUpError) {
        console.error('Signup error:', signUpError);
        setError(signUpError.message);
        return;
      }
      
      if (!signUpData.user) {
        console.error('No user returned from signup');
        setError('Failed to create user account. Please try again.');
        return;
      }
      
      console.log('User created:', signUpData.user.id);
      console.log('Session exists:', !!signUpData.session);
      
      // Check if email confirmation is required
      if (!signUpData.session) {
        console.log('No session - email confirmation required');
        setSuccessType('email-confirmation');
        setSuccess(true);
        setTimeout(() => {
          navigate('/verify-email');
        }, 2000);
        return;
      }
      
      // Session exists - user is auto-confirmed
      console.log('Session exists - setting session explicitly...');
      
      // Explicitly set the session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: signUpData.session.access_token,
        refresh_token: signUpData.session.refresh_token,
      });
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError('Failed to establish session. Please try signing in.');
        return;
      }
      
      console.log('Session set successfully');
      
      // Wait a moment for session to propagate
      console.log('Waiting for session to propagate...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify session is active
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('Current session:', currentSession.session?.user?.id);
      
      if (!currentSession.session) {
        console.error('Session not established');
        setError('Session not established. Please try signing in.');
        return;
      }
      
      console.log('Step 2: Creating business...');
      
      // Now create business (user should be authenticated)
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: data.businessName,
          user_id: signUpData.user.id,
          industry: 'Septic Services',
          avg_job_value: 575,
        })
        .select()
        .single();
      
      if (businessError) {
        console.error('Business creation error:', businessError);
        console.error('Error details:', JSON.stringify(businessError, null, 2));
        setError(`Failed to create business profile: ${businessError.message}`);
        return;
      }
      
      console.log('Business created:', business.id);
      console.log('Step 3: Creating default services...');
      
      // Create default services
      const defaultServices = [
        { name: 'Emergency Pumping', price_min: 400, price_max: 600, urgency_level: 'Emergency', duration_minutes: 120 },
        { name: 'Routine Pumping', price_min: 250, price_max: 400, urgency_level: 'Flexible', duration_minutes: 90 },
        { name: 'Septic Inspection', price_min: 150, price_max: 250, urgency_level: 'Same Day', duration_minutes: 60 },
        { name: 'Drain Field Repair', price_min: 800, price_max: 1500, urgency_level: 'Emergency', duration_minutes: 240 },
        { name: 'System Installation', price_min: 3000, price_max: 8000, urgency_level: 'Flexible', duration_minutes: 480 },
      ];
      
      const { error: servicesError } = await supabase.from('services').insert(
        defaultServices.map(service => ({
          ...service,
          business_id: business.id,
        }))
      );
      
      if (servicesError) {
        console.error('Services creation error:', servicesError);
        // Don't fail signup if services fail
      } else {
        console.log('Default services created');
      }
      
      console.log('=== SIGNUP FLOW COMPLETE ===');
      console.log('Redirecting to dashboard...');
      
      setSuccessType('auto-confirmed');
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Unexpected signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-6">
              {successType === 'email-confirmation' 
                ? 'Your account has been created successfully. Please check your email for a confirmation link to complete your registration.'
                : 'Your business profile and default services have been set up successfully. You\'re ready to start using your AI Voice Agent!'
              }
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">
              {successType === 'email-confirmation' 
                ? 'Redirecting to email verification...'
                : 'Redirecting to dashboard...'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Voice Agent</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Business Name Field */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('businessName')}
                  type="text"
                  id="businessName"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your business name"
                />
              </div>
              {errors.businessName && (
                <p className="mt-2 text-sm text-red-600">{errors.businessName.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          level <= passwordStrength
                            ? strengthColors[passwordStrength - 1]
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                  </p>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
