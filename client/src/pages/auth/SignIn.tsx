import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import AuthLayout from '@/components/auth/AuthLayout';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<{type?: 'success' | 'error'; message?: string}>({});
  
  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    let isValid = true;
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      
      // Temporary successful sign in logic
      // This would be replaced with actual authentication API call
      if (email === 'demo@willtank.com' && password === 'password123') {
        setAuthStatus({
          type: 'success',
          message: 'Sign in successful! Redirecting...'
        });
        
        // Redirect after successful login
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setAuthStatus({
          type: 'error',
          message: 'Invalid email or password'
        });
      }
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
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Sign in to WillTank</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Enter your credentials to access your account
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
          
          <AuthInput
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={<Lock className="h-5 w-5" />}
            autoComplete="current-password"
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
            <AuthButton type="submit" isLoading={isLoading}>
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
            >
              Continue with Google
            </AuthButton>
          </div>
        </form>
        
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
      </div>
    </AuthLayout>
  );
};

export default SignIn;