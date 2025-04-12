import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import { useAuth } from '@/hooks/use-auth';

const SignUp: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
    agreeToTerms?: string;
  }>({});
  const [authStatus, setAuthStatus] = useState<{type?: 'success' | 'error'; message?: string}>({});
  
  const { user, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/redirect');
    }
  }, [user, navigate]);
  
  const validateForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    if (!agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setAuthStatus({});
    
    try {
      await registerMutation.mutateAsync({
        username,
        password
      });
      
      // Success is handled by the mutation hook
      // Redirect to home is handled by useEffect
      
    } catch (error) {
      setAuthStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      });
    }
  };

  return (
    <AuthLayout 
      title="Join WillTank"
      subtitle="Create an account to start securing your legacy with our AI-powered will creation platform."
      quote="Planning for tomorrow brings peace today."
    >
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Create an account</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Get started with your free account today
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
        
        <form onSubmit={handleSubmit} className="space-y-1">
          <AuthInput
            label="Username"
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            icon={<User className="h-5 w-5" />}
            autoComplete="username"
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
            
            <div className="flex items-center justify-center my-4">
              <div className="border-t border-neutral-200 dark:border-neutral-700 flex-grow"></div>
              <span className="mx-4 text-neutral-500 text-sm">or sign up with</span>
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