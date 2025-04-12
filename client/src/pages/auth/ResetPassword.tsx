import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Lock, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';

const ResetPassword: React.FC = () => {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{password?: string; confirmPassword?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [authStatus, setAuthStatus] = useState<{type?: 'success' | 'error'; message?: string}>({});
  
  const validateForm = () => {
    const newErrors: {password?: string; confirmPassword?: string} = {};
    let isValid = true;
    
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
        message: 'Your password has been reset successfully!'
      });
      
      // Redirect to login after successful password reset
      setTimeout(() => {
        setLocation('/auth/sign-in');
      }, 2000);
    } catch (error) {
      setAuthStatus({
        type: 'error',
        message: 'Something went wrong. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    let label = 'Very weak';
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Assign label based on strength score
    if (strength >= 6) label = 'Strong';
    else if (strength >= 4) label = 'Good';
    else if (strength >= 2) label = 'Fair';
    else if (strength >= 1) label = 'Weak';
    
    // Normalize to 0-100 scale
    const normalizedStrength = Math.min(Math.round((strength / 6) * 100), 100);
    
    return { 
      strength: normalizedStrength, 
      label 
    };
  };
  
  const passwordStrength = getPasswordStrength();
  
  // Get color for password strength indicator
  const getStrengthColor = () => {
    const { strength } = passwordStrength;
    if (strength >= 80) return 'bg-green-500';
    if (strength >= 60) return 'bg-emerald-500';
    if (strength >= 40) return 'bg-yellow-500';
    if (strength >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <AuthLayout 
      title="Reset your password"
      subtitle="Create a new secure password for your WillTank account."
      quote="With security comes confidence. With confidence comes peace of mind."
    >
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Create New Password</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Your password must be different from previously used passwords
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
              label="New Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<Lock className="h-5 w-5" />}
              autoComplete="new-password"
              required
            />
            
            {password && (
              <div className="mb-4 mt-1 px-1">
                <div className="h-1 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${getStrengthColor()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${passwordStrength.strength}%` }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-neutral-500">Password strength</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.strength >= 60 ? 'text-green-600 dark:text-green-400' : 
                    passwordStrength.strength >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
            
            <AuthInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              icon={<Lock className="h-5 w-5" />}
              autoComplete="new-password"
              required
            />
            
            <div className="mt-6 space-y-4">
              <AuthButton type="submit" isLoading={isLoading}>
                Reset Password
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
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Password Reset Complete</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
            <AuthButton 
              type="button" 
              onClick={() => setLocation('/auth/sign-in')}
            >
              Go to Sign In
            </AuthButton>
          </motion.div>
        )}
        
        <div className="mt-8 text-center">
          <Link href="/auth/sign-in">
            <span className="text-primary hover:text-primary-dark transition-colors cursor-pointer">
              Remember your password? Sign in
            </span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;