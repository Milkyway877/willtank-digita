import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';

import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import { useAuth } from '@/hooks/use-auth';

// Registration step flow
enum SignUpStep {
  REGISTER = 'register',
  VERIFY_EMAIL = 'verify_email',
}

const SignUp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<SignUpStep>(SignUpStep.REGISTER);
  
  // Registration form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  // Error state
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeToTerms?: string;
    verificationCode?: string;
  }>({});
  
  const [authStatus, setAuthStatus] = useState<{type?: 'success' | 'error' | 'warning'; message?: string}>({});
  
  // Auth hooks
  const { user, registerMutation, verifyEmailMutation, resendVerificationMutation } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if user is already logged in and verified
  useEffect(() => {
    if (user && user.isEmailVerified) {
      navigate('/'); // Navigate to dashboard or onboarding
    }
  }, [user, navigate]);
  
  const validateRegistrationForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    // Terms agreement validation
    if (!agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const validateVerificationForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;
    
    if (!verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
      isValid = false;
    } else if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      newErrors.verificationCode = 'Please enter a valid 6-digit code';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegistrationForm()) return;
    
    setAuthStatus({});
    
    try {
      await registerMutation.mutateAsync({
        username: email.toLowerCase(), // Using email as username
        password
      });
      
      // Move to email verification step
      setCurrentStep(SignUpStep.VERIFY_EMAIL);
      
      setAuthStatus({
        type: 'success',
        message: 'Account created! Please check your email for verification code.'
      });
      
    } catch (error) {
      setAuthStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Registration failed. Please try again.'
      });
    }
  };
  
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateVerificationForm()) return;
    
    setAuthStatus({});
    
    try {
      await verifyEmailMutation.mutateAsync({
        email: email.toLowerCase(),
        code: verificationCode
      });
      
      setAuthStatus({
        type: 'success',
        message: 'Email verified successfully! Redirecting...'
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      setAuthStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Verification failed. Please try again.'
      });
    }
  };
  
  const handleResendCode = async () => {
    try {
      await resendVerificationMutation.mutateAsync({
        email: email.toLowerCase()
      });
      
      setAuthStatus({
        type: 'success',
        message: 'A new verification code has been sent to your email'
      });
    } catch (error) {
      setAuthStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to resend verification code'
      });
    }
  };
  
  const handleBackToRegister = () => {
    setCurrentStep(SignUpStep.REGISTER);
    setAuthStatus({});
  };

  return (
    <AuthLayout 
      title="Join WillTank"
      subtitle="Create an account to start securing your legacy with our AI-powered will creation platform."
      quote="Planning for tomorrow brings peace today."
    >
      <div>
        <motion.div
          key={`heading-${currentStep}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {currentStep === SignUpStep.REGISTER ? (
            <>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Create an account</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Get started with your free account today
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Verify your email</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                We've sent a verification code to <span className="font-medium">{email}</span>
              </p>
            </>
          )}
        </motion.div>
        
        {authStatus.message && (
          <motion.div
            key={`alert-${authStatus.message}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg mb-4 flex items-center ${
              authStatus.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
                : authStatus.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}
          >
            {authStatus.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : authStatus.type === 'warning' ? (
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            )}
            <span>{authStatus.message}</span>
          </motion.div>
        )}
        
        {currentStep === SignUpStep.REGISTER ? (
          /* Registration Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-1">
            <AuthInput
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="h-5 w-5" />}
              autoComplete="email"
              placeholder="Enter your email address"
              required
            />
            
            <AuthInput
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock className="h-5 w-5" />}
              autoComplete="new-password"
              placeholder="Create a password (min. 8 characters)"
              required
            />
            
            <AuthInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              icon={<Lock className="h-5 w-5" />}
              autoComplete="new-password"
              placeholder="Confirm your password"
              required
            />
            
            <div className="mt-4 mb-6">
              <label className="flex items-start text-sm text-neutral-600 dark:text-neutral-400">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-primary focus:ring-primary mt-1 mr-2"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
                <span>
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:text-primary-dark transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:text-primary-dark transition-colors">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-xs mt-1 ml-6">{errors.agreeToTerms}</p>
              )}
            </div>
            
            <div className="space-y-4">
              <AuthButton type="submit" isLoading={registerMutation.isPending}>
                Create Account
              </AuthButton>
            </div>
          </form>
        ) : (
          /* Verification Form */
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Enter the 6-digit verification code sent to your email.
                If you don't see it, check your spam folder.
              </p>
            </div>
            
            <AuthInput
              label="Verification Code"
              type="text"
              name="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              error={errors.verificationCode}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="text-center tracking-widest text-lg"
              required
            />
            
            <div className="mt-6 space-y-4">
              <AuthButton
                type="submit"
                isLoading={verifyEmailMutation.isPending}
              >
                Verify Email <ArrowRight className="ml-2 h-4 w-4" />
              </AuthButton>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleBackToRegister}
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors"
                >
                  Go back
                </button>
                
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendVerificationMutation.isPending}
                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  {resendVerificationMutation.isPending ? 'Sending...' : 'Resend code'}
                </button>
              </div>
            </div>
          </form>
        )}
        
        <p className="mt-8 text-center text-neutral-600 dark:text-neutral-400">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="text-primary hover:text-primary-dark transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;