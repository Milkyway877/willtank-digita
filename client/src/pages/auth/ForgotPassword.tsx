import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{email?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [authStatus, setAuthStatus] = useState<{type?: 'success' | 'error'; message?: string}>({});
  
  const validateForm = () => {
    const newErrors: {email?: string} = {};
    let isValid = true;
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setAuthStatus({});
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      setAuthStatus({
        type: 'success',
        message: 'Password reset instructions have been sent to your email.'
      });
    } catch (error) {
      setAuthStatus({
        type: 'error',
        message: 'Something went wrong. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Reset your password"
      subtitle="Enter your email and we'll send you instructions to reset your password."
      quote="Peace of mind comes from knowing your legacy is secure."
    >
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Forgot Password</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Don't worry, it happens to the best of us
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
            <AuthInput
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="h-5 w-5" />}
              autoComplete="email"
              required
            />
            
            <div className="mt-6 space-y-4">
              <AuthButton type="submit" isLoading={isLoading}>
                Send Reset Instructions
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
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Check your inbox</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              We've sent password reset instructions to:
            </p>
            <p className="font-medium text-neutral-900 dark:text-white mb-4">{email}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-6">
              If you don't see the email, check other places it might be, like your junk, spam, social, or other folders.
            </p>
            <AuthButton 
              type="button" 
              variant="secondary"
              onClick={() => setIsSubmitted(false)}
            >
              Use a different email
            </AuthButton>
          </motion.div>
        )}
        
        <div className="mt-8">
          <Link href="/auth/sign-in">
            <a className="inline-flex items-center text-primary hover:text-primary-dark transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </a>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;