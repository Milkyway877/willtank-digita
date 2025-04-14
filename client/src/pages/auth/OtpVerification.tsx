import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useRoute } from 'wouter';
import { AlertCircle, CheckCircle2, ArrowLeft, AlertTriangle } from 'lucide-react';

import AuthLayout from '@/components/auth/AuthLayout';
import AuthButton from '@/components/auth/AuthButton';
import { useAuth } from '@/hooks/use-auth';
import { getWillProgress } from '@/lib/will-progress-tracker';

const OtpVerification: React.FC = () => {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/auth/verify/:email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [authStatus, setAuthStatus] = useState<{type?: 'success' | 'error' | 'warning'; message?: string}>({});
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  
  const { verifyEmailMutation, resendVerificationMutation } = useAuth();
  
  // Extract email from URL
  useEffect(() => {
    if (match && params?.email) {
      try {
        // Decode the email from URL
        const decodedEmail = decodeURIComponent(params.email);
        setEmail(decodedEmail);
      } catch (error) {
        setAuthStatus({
          type: 'error',
          message: 'Invalid email address in URL.'
        });
      }
    }
  }, [match, params]);
  
  // Set up countdown timer
  useEffect(() => {
    if (countdown > 0 && !isSubmitted) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isSubmitted]);
  
  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);
  
  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^[0-9]$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Navigate with arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current?.[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current?.[index + 1]?.focus();
    }
    
    // Go to previous on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current?.[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!/^[0-9]{6}$/.test(pastedData)) return;
    
    const digits = pastedData.split('');
    setOtp(digits);
    inputRefs.current[5]?.focus();
  };
  
  const resendOtp = async () => {
    if (!email) {
      setAuthStatus({
        type: 'error',
        message: 'Email address is missing.'
      });
      return;
    }
    
    setCountdown(30);
    setAuthStatus({});
    
    try {
      await resendVerificationMutation.mutateAsync({ email });
      
      setAuthStatus({
        type: 'success',
        message: 'A new verification code has been sent to your email.'
      });
    } catch (error) {
      setAuthStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to resend verification code.'
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setAuthStatus({
        type: 'error',
        message: 'Email address is missing. Please go back to the sign-up page.'
      });
      return;
    }
    
    if (otp.some(digit => !digit)) {
      setAuthStatus({
        type: 'error',
        message: 'Please enter all 6 digits of the verification code.'
      });
      return;
    }
    
    setAuthStatus({});
    
    try {
      const verificationCode = otp.join('');
      
      await verifyEmailMutation.mutateAsync({
        email: email,
        code: verificationCode
      });
      
      setIsSubmitted(true);
      setAuthStatus({
        type: 'success',
        message: 'Email verified successfully!'
      });
      
      // For new users coming from registration, direct them to welcome page
      setTimeout(() => {
        // Direct new users to welcome page after verification
        // From there they can begin the will creation process
        setLocation('/welcome');
      }, 2000);
    } catch (error) {
      setAuthStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Verification failed. Please try again.'
      });
    }
  };

  return (
    <AuthLayout 
      title="Verification required"
      subtitle="We've sent a 6-digit verification code to your email. Enter the code below to continue."
      quote="Security is not a product, but a process."
    >
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Enter Verification Code</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please enter the 6-digit code sent to your email
          </p>
        </motion.div>
        
        {authStatus.message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg mb-4 flex items-center ${
              authStatus.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}
          >
            {authStatus.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            )}
            <span>{authStatus.message}</span>
          </motion.div>
        )}
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <div className="my-8">
              <div className="flex justify-center space-x-3 mx-auto">
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    className="w-12 h-14 text-center text-2xl font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all text-neutral-900 dark:text-white bg-white dark:bg-neutral-800"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleInputChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    autoComplete="off"
                    required
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  />
                ))}
              </div>
              
              <p className="text-center mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                Didn't receive the code?{' '}
                {countdown > 0 ? (
                  <span>Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    className="text-primary hover:text-primary-dark transition-colors font-medium"
                    onClick={resendOtp}
                  >
                    Resend code
                  </button>
                )}
              </p>
            </div>
            
            <div className="mt-6 space-y-4">
              <AuthButton type="submit" isLoading={verifyEmailMutation.isPending}>
                Verify
              </AuthButton>
            </div>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center p-6 bg-primary/5 rounded-lg my-4"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Verification Complete</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Your account has been successfully verified. You will be redirected shortly.
            </p>
            <AuthButton 
              type="button" 
              onClick={() => {
                // New users coming from verification should start at welcome page
                setLocation('/welcome');
              }}
            >
              Continue
            </AuthButton>
          </motion.div>
        )}
        
        {!isSubmitted && (
          <div className="mt-8">
            <Link href="/auth/sign-up">
              <span className="inline-flex items-center text-primary hover:text-primary-dark transition-colors cursor-pointer">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign up
              </span>
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default OtpVerification;