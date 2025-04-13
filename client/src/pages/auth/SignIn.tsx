import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Mail, Lock, AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import { useAuth } from '@/hooks/use-auth';
import { use2FA } from '@/hooks/use-2fa';
import { 
  hasUnfinishedWill, 
  getWillProgress, 
  WillCreationStep 
} from '@/lib/will-progress-tracker';

enum LoginStep {
  INITIAL = 'initial',
  VERIFICATION = 'verification',
  TWO_FACTOR = 'two-factor'
}

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>(LoginStep.INITIAL);
  
  const [errors, setErrors] = useState<{
    email?: string; 
    password?: string;
    verificationCode?: string;
    twoFactorCode?: string;
  }>({});
  
  const [authStatus, setAuthStatus] = useState<{
    type?: 'success' | 'error' | 'warning' | 'info'; 
    message?: string;
  }>({});
  
  // Get auth hooks
  const { 
    user, 
    loginMutation, 
    requestLoginCodeMutation,
    resendVerificationMutation,
    refetchUser
  } = useAuth();
  
  // Get 2FA hooks
  const { verifyTokenMutation } = use2FA();
  
  const [, navigate] = useLocation();
  
  // Remove duplicate import - already imported at the top
  
  // Redirect if user is already logged in and verified
  useEffect(() => {
    if (user) {
      if (user.isEmailVerified) {
        // Check if the user has a completed will
        const progress = getWillProgress();
        
        if (progress && progress.completed) {
          // If will is completed, go to dashboard
          navigate('/dashboard');
        } else {
          // If no completed will, go to onboarding or template selection
          navigate('/onboarding');
        }
      } else {
        // If user is logged in but not verified, redirect to verification page
        navigate(`/auth/verify/${encodeURIComponent(user.username)}`);
      }
    }
  }, [user, navigate]);
  
  const validateInitialForm = () => {
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
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const validateVerificationForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;
    
    // Email and password should be already validated at this point
    
    // Verification code validation
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
  
  const validateTwoFactorForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;
    
    // Two-factor code validation
    if (!twoFactorCode) {
      newErrors.twoFactorCode = 'Authentication code is required';
      isValid = false;
    } else if (twoFactorCode.length !== 6 || !/^\d+$/.test(twoFactorCode)) {
      newErrors.twoFactorCode = 'Please enter a valid 6-digit code';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Request a login verification code
  const handleRequestVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInitialForm()) return;
    
    setAuthStatus({});
    
    try {
      // Request login verification code
      const response = await requestLoginCodeMutation.mutateAsync({ 
        username: email.toLowerCase() 
      });
      
      // Move to verification step
      setLoginStep(LoginStep.VERIFICATION);
      
      setAuthStatus({
        type: 'success',
        message: 'A verification code has been sent to your email'
      });
      
    } catch (error: any) {
      // Check for specific error indicating user needs to verify email first
      if (error.message && error.message.includes('verify your email')) {
        setAuthStatus({
          type: 'warning',
          message: 'Please verify your email address before logging in'
        });
        
        // Redirect to email verification page
        navigate(`/auth/verify/${encodeURIComponent(email.toLowerCase())}`);
        
        // Trigger resend verification
        await resendVerificationMutation.mutateAsync({ email: email.toLowerCase() });
      } else {
        setAuthStatus({
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to request verification code'
        });
      }
    }
  };
  
  // Complete login with verification code
  const handleCompleteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateVerificationForm()) return;
    
    setAuthStatus({});
    
    try {
      // Login with credentials and verification code
      const response = await loginMutation.mutateAsync({ 
        username: email.toLowerCase(), 
        password,
        verificationCode
      });
      
      // Check if email needs verification (should not happen at this point)
      if (response && !response.isEmailVerified) {
        // Redirect to dedicated verification page
        navigate(`/auth/verify/${encodeURIComponent(email.toLowerCase())}`);
        
        // Trigger resend verification code
        await resendVerificationMutation.mutateAsync({ email: email.toLowerCase() });
      } else if (response && response.requiresTwoFactor) {
        // If 2FA is enabled for this user, proceed to the 2FA step
        setLoginStep(LoginStep.TWO_FACTOR);
        setAuthStatus({
          type: 'info',
          message: 'Please enter your authentication code to complete sign in'
        });
      } else {
        // For verified users, check if they have a will and redirect accordingly
        await refetchUser(); // Explicitly fetch user data
        
        // Will check and redirect to dashboard will be handled by useEffect after user is set
      }
      
    } catch (error: any) {
      // Check for specific errors
      if (error.message && error.message.includes('verification code')) {
        setAuthStatus({
          type: 'error',
          message: error.message
        });
      } else if (error.message && error.message.includes('verify your email')) {
        setAuthStatus({
          type: 'warning',
          message: 'Please verify your email address before logging in'
        });
        
        // Redirect to email verification page
        navigate(`/auth/verify/${encodeURIComponent(email.toLowerCase())}`);
        
        // Trigger resend verification
        await resendVerificationMutation.mutateAsync({ email: email.toLowerCase() });
      } else {
        setAuthStatus({
          type: 'error',
          message: error instanceof Error ? error.message : 'Login failed'
        });
      }
    }
  };
  
  // Complete login with 2FA verification
  const handleTwoFactorVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTwoFactorForm()) return;
    
    setAuthStatus({});
    
    try {
      // Verify 2FA token
      await verifyTokenMutation.mutateAsync({ token: twoFactorCode });
      
      // If successful, fetch the user data again
      await refetchUser();
      
      // Will check and redirect to dashboard will be handled by useEffect after user is set
      
    } catch (error: any) {
      setAuthStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to verify authentication code'
      });
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginStep === LoginStep.INITIAL) {
      await handleRequestVerificationCode(e);
    } else if (loginStep === LoginStep.TWO_FACTOR) {
      await handleTwoFactorVerification(e);
    } else {
      await handleCompleteLogin(e);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back"
      subtitle="Sign in to continue to your account and manage your will documents securely."
    >
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {loginStep === LoginStep.INITIAL 
              ? "Sign in to WillTank" 
              : loginStep === LoginStep.TWO_FACTOR
                ? "Two-Factor Authentication"
                : "Verification Required"
            }
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {loginStep === LoginStep.INITIAL 
              ? "Enter your credentials to access your account" 
              : loginStep === LoginStep.TWO_FACTOR
                ? "Enter the authentication code from your authenticator app"
                : "We've sent a verification code to your email"
            }
          </p>
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
                : authStatus.type === 'info'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}
          >
            {authStatus.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : authStatus.type === 'warning' ? (
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : authStatus.type === 'info' ? (
              <ShieldCheck className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            )}
            <span>{authStatus.message}</span>
          </motion.div>
        )}
        
        {/* Login Form */}
        <form onSubmit={handleLogin}>
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
            disabled={loginStep === LoginStep.VERIFICATION || loginStep === LoginStep.TWO_FACTOR}
          />
          
          <AuthInput
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={<Lock className="h-5 w-5" />}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            disabled={loginStep === LoginStep.VERIFICATION || loginStep === LoginStep.TWO_FACTOR}
          />
          
          {loginStep === LoginStep.VERIFICATION && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <AuthInput
                label="Verification Code"
                type="text"
                name="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                error={errors.verificationCode}
                icon={<ShieldCheck className="h-5 w-5" />}
                placeholder="Enter the 6-digit code sent to your email"
                required
              />
              <div className="flex justify-between text-sm mb-4">
                <button
                  type="button"
                  className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors"
                  onClick={() => setLoginStep(LoginStep.INITIAL)}
                >
                  ← Change email/password
                </button>
                <button
                  type="button"
                  className="text-primary hover:text-primary-dark transition-colors"
                  onClick={() => handleRequestVerificationCode({ preventDefault: () => {} } as React.FormEvent)}
                  disabled={requestLoginCodeMutation.isPending}
                >
                  Resend code
                </button>
              </div>
            </motion.div>
          )}
          
          {loginStep === LoginStep.TWO_FACTOR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <AuthInput
                label="Authentication Code"
                type="text"
                name="twoFactorCode"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                error={errors.twoFactorCode}
                icon={<ShieldCheck className="h-5 w-5" />}
                placeholder="Enter the 6-digit code from your authenticator app"
                required
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
              />
              <div className="mt-2 mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                <p>Open your authenticator app to view your verification code.</p>
              </div>
            </motion.div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <label className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-primary focus:ring-primary mr-2"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            
            <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary-dark transition-colors">
              Forgot password?
            </Link>
          </div>
          
          <div className="space-y-4">
            <AuthButton 
              type="submit" 
              isLoading={loginStep === LoginStep.INITIAL 
                ? requestLoginCodeMutation.isPending 
                : loginStep === LoginStep.TWO_FACTOR
                  ? verifyTokenMutation.isPending
                  : loginMutation.isPending
              }
            >
              {loginStep === LoginStep.INITIAL 
                ? "Continue" 
                : loginStep === LoginStep.TWO_FACTOR
                  ? "Verify"
                  : "Sign In"
              }
            </AuthButton>
            
            <div className="flex items-center justify-center my-4">
              <div className="border-t border-neutral-200 dark:border-neutral-700 flex-grow"></div>
              <span className="mx-4 text-neutral-500 text-sm">or continue with</span>
              <div className="border-t border-neutral-200 dark:border-neutral-700 flex-grow"></div>
            </div>
            
            <AuthButton
              type="button"
              variant="social"
              icon={<FcGoogle className="h-5 w-5" />}
              isLoading={false}
            >
              Continue with Google
            </AuthButton>
          </div>
        </form>
        
        <p className="mt-8 text-center text-neutral-600 dark:text-neutral-400">
          Don't have an account?{' '}
          <a 
            href="/auth/sign-up" 
            className="text-primary hover:text-primary-dark transition-colors font-medium"
            onClick={(e) => {
              e.preventDefault();
              navigate('/auth/sign-up');
            }}
          >
            Sign up
          </a>
        </p>
        
        <div className="mt-8 text-center text-xs text-neutral-500 dark:text-neutral-600">
          By signing in, you agree to our{' '}
          <a href="#" className="underline hover:text-primary">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline hover:text-primary">
            Privacy Policy
          </a>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignIn;