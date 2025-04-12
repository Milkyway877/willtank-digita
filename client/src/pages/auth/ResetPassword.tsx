import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useRoute } from 'wouter';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import { useAuth } from '@/hooks/use-auth';

// Process steps
enum ResetStep {
  RESET = 'reset',
  SUCCESS = 'success',
}

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.RESET);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [authStatus, setAuthStatus] = useState<{type?: 'success' | 'error'; message?: string}>({});
  
  const { resetPasswordMutation } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/auth/reset-password/:token');
  
  // Extract token from URL
  useEffect(() => {
    if (match && params?.token) {
      setResetToken(params.token);
    }
  }, [match, params]);
  
  const validateForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;
    
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
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!resetToken) {
      setAuthStatus({
        type: 'error',
        message: 'Reset token is missing. Please use the link from your email.'
      });
      return;
    }
    
    setAuthStatus({});
    
    try {
      await resetPasswordMutation.mutateAsync({
        token: resetToken,
        password: password
      });
      
      // Show success state
      setCurrentStep(ResetStep.SUCCESS);
      
    } catch (error) {
      setAuthStatus({
        type: 'error',
        message: error instanceof Error 
          ? error.message 
          : 'Password reset failed. The link may have expired.'
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
      subtitle="Create a new secure password for your account."
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
          {currentStep === ResetStep.RESET ? (
            <>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Create new password</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Your new password must be different from previous passwords.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Password reset complete</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Your password has been successfully reset.
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
        
        {currentStep === ResetStep.RESET ? (
          <form onSubmit={handleSubmit}>
            <motion.div variants={itemAnimation}>
              <AuthInput
                label="New Password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={<Lock className="h-5 w-5" />}
                placeholder="Create a new password"
                autoComplete="new-password"
                required
              />
            </motion.div>
            
            <motion.div variants={itemAnimation}>
              <AuthInput
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                icon={<Lock className="h-5 w-5" />}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
            </motion.div>
            
            <motion.div
              variants={itemAnimation}
              className="mt-6 space-y-4"
            >
              <AuthButton type="submit" isLoading={resetPasswordMutation.isPending}>
                Reset Password
              </AuthButton>
            </motion.div>
          </form>
        ) : (
          <motion.div 
            variants={itemAnimation} 
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className="bg-green-50 dark:bg-green-900/20 w-20 h-20 flex items-center justify-center rounded-full">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Your password has been successfully reset. You can now use your new password to sign in to your account.
            </p>
            
            <div className="mt-4">
              <AuthButton
                type="button"
                onClick={() => navigate('/auth/sign-in')}
              >
                Sign in
              </AuthButton>
            </div>
          </motion.div>
        )}
        
        <motion.div 
          variants={itemAnimation}
          className="mt-8 text-center"
        >
          <Link href="/auth/sign-in">
            <button type="button" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
};

export default ResetPassword;