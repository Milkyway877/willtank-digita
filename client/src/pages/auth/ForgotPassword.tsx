import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import { useAuth } from '@/hooks/use-auth';

// Process steps
enum ResetStep {
  REQUEST = 'request',
  CONFIRMATION = 'confirmation',
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.REQUEST);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [authStatus, setAuthStatus] = useState<{type?: 'success' | 'error'; message?: string}>({});
  
  const { forgotPasswordMutation } = useAuth();
  const [, navigate] = useLocation();
  
  const validateForm = () => {
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
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setAuthStatus({});
    
    try {
      await forgotPasswordMutation.mutateAsync({ email: email.toLowerCase() });
      
      // Move to confirmation step
      setCurrentStep(ResetStep.CONFIRMATION);
      
    } catch (error) {
      setAuthStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to process request. Please try again.'
      });
    }
  };
  
  // Animation variants
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <AuthLayout 
      title="Reset your password"
      subtitle="We'll send you instructions to reset your password."
    >
      <motion.div
        variants={containerAnimation}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={itemAnimation}
          className="mb-8"
        >
          {currentStep === ResetStep.REQUEST ? (
            <>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Forgot password?</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                No worries, we'll send you reset instructions.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Check your email</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                We've sent a password reset link to <span className="font-medium">{email}</span>
              </p>
            </>
          )}
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
        
        {currentStep === ResetStep.REQUEST ? (
          <form onSubmit={handleSubmit}>
            <motion.div variants={itemAnimation}>
              <AuthInput
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                icon={<Mail className="h-5 w-5" />}
                placeholder="Enter your email address"
                autoComplete="email"
                required
              />
            </motion.div>
            
            <motion.div
              variants={itemAnimation}
              className="mt-6 space-y-4"
            >
              <AuthButton type="submit" isLoading={forgotPasswordMutation.isPending}>
                Send reset instructions
              </AuthButton>
              
              <Link href="/auth/sign-in">
                <button type="button" className="w-full flex items-center justify-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </button>
              </Link>
            </motion.div>
          </form>
        ) : (
          <motion.div 
            variants={itemAnimation} 
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className="bg-primary/10 w-20 h-20 flex items-center justify-center rounded-full">
                <Mail className="h-10 w-10 text-primary" />
              </div>
            </div>
            
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              If you don't see the email in your inbox, please check your spam folder.
              If you still don't see it, try requesting another reset link.
            </p>
            
            <div className="space-y-4 mt-4">
              <AuthButton 
                type="button" 
                onClick={() => setCurrentStep(ResetStep.REQUEST)}
              >
                Resend email
              </AuthButton>
              
              <Link href="/auth/sign-in">
                <button type="button" className="w-full flex items-center justify-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AuthLayout>
  );
};

export default ForgotPassword;