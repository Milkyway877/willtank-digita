import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Mail, Lock, AlertCircle, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import { useAuth } from '@/hooks/use-auth';

// For email verification after login if needed
enum LoginState {
  LOGIN = 'login',
  VERIFY_EMAIL = 'verify_email',
}

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>(LoginState.LOGIN);
  
  const [errors, setErrors] = useState<{
    email?: string; 
    password?: string;
    verificationCode?: string;
  }>({});
  
  const [authStatus, setAuthStatus] = useState<{
    type?: 'success' | 'error' | 'warning'; 
    message?: string;
  }>({});
  
  // Get auth hooks
  const { 
    user, 
    loginMutation, 
    verifyEmailMutation, 
    resendVerificationMutation 
  } = useAuth();
  
  const [, navigate] = useLocation();
  
  // Redirect if user is already logged in and verified
  useEffect(() => {
    if (user && user.isEmailVerified) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const validateLoginForm = () => {
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
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setAuthStatus({});
    
    try {
      const response = await loginMutation.mutateAsync({ 
        username: email.toLowerCase(), 
        password 
      });
      
      // Check if email needs verification
      if (response && !response.isEmailVerified) {
        // Show verification required message and switch to verification form
        setAuthStatus({
          type: 'warning',
          message: 'Please verify your email to continue'
        });
        setLoginState(LoginState.VERIFY_EMAIL);
        
        // Trigger resend verification code
        await resendVerificationMutation.mutateAsync({ email: email.toLowerCase() });
      }
      // Otherwise, success status is handled by the hook
      // Navigate is handled by useEffect when user is set
      
    } catch (error) {
      setAuthStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Invalid email or password'
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
  
  const handleBackToLogin = () => {
    setLoginState(LoginState.LOGIN);
    setAuthStatus({});
  };

  return (
    <AuthLayout 
      title="Welcome back"
      subtitle="Sign in to continue to your account and manage your will documents securely."
    >
      <div>
        <motion.div
          key={`heading-${loginState}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {loginState === LoginState.LOGIN ? (
            <>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Sign in to WillTank</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Enter your credentials to access your account
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
        
        {loginState === LoginState.LOGIN ? (
          // Login Form
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
            />
            
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
              <AuthButton type="submit" isLoading={loginMutation.isPending}>
                Sign In
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
        ) : (
          // Email Verification Form
          <form onSubmit={handleVerifyEmail}>
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
                  onClick={handleBackToLogin}
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
        
        {loginState === LoginState.LOGIN && (
          <>
            <p className="mt-8 text-center text-neutral-600 dark:text-neutral-400">
              Don't have an account?{' '}
              <Link href="/auth/sign-up" className="text-primary hover:text-primary-dark transition-colors font-medium">
                Sign up
              </Link>
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
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default SignIn;