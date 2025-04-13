import React, { useState } from 'react';
import { ShieldAlert, Shield, Eye, EyeOff, Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { use2FA } from '@/hooks/use-2fa';
import { useQuery } from '@tanstack/react-query';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TwoFactorAuth: React.FC = () => {
  const { 
    status, 
    isLoading, 
    generateSecretMutation, 
    verifyAndEnableMutation, 
    disableMutation, 
    clearSecret 
  } = use2FA();
  
  // Local state
  const [token, setToken] = useState('');
  const [disableToken, setDisableToken] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  
  // Get the generated secret if available
  const { data: secretData } = useQuery<{
    secret: string;
    qrCode: string;
    otpAuthUrl: string;
  }>({
    queryKey: ['/api/2fa/secret'],
    enabled: false,
  });
  
  // Get backup codes if available
  const { data: backupCodes } = useQuery({
    queryKey: ['/api/2fa/backupCodes'],
    enabled: false,
  });
  
  // Handle token input
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 6 characters
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setToken(value);
  };
  
  // Handle disable token input
  const handleDisableTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 6 characters
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setDisableToken(value);
  };
  
  // Generate QR code
  const handleGenerateQR = () => {
    generateSecretMutation.mutate();
  };
  
  // Enable 2FA
  const handleEnable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.length !== 6) return;
    verifyAndEnableMutation.mutate(token);
  };
  
  // Disable 2FA
  const handleDisable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if button should be disabled
    if (disableMutation.isPending || !password) {
      return;
    }
    
    disableMutation.mutate({ password, token: disableToken || undefined });
  };
  
  // Cancel setup
  const handleCancelSetup = () => {
    clearSecret();
    setToken('');
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Loading 2FA status...</span>
      </div>
    );
  }
  
  // Enabled state
  if (status?.enabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-emerald-500 mr-2" />
          <h4 className="font-medium text-gray-800 dark:text-white">Two-Factor Authentication</h4>
          <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 rounded-full">
            Enabled
          </span>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your account is protected with two-factor authentication. To disable 2FA, enter your password and current authenticator code.
        </p>
        
        <form onSubmit={handleDisable2FA} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Authentication Code (Optional)
            </label>
            <input
              type="text"
              value={disableToken}
              onChange={handleDisableTokenChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white"
              placeholder="Enter 6-digit code"
            />
          </div>
          
          <button
            type="submit"
            disabled={disableMutation.isPending || !password}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {disableMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Disabling...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1.5" />
                Disable 2FA
              </>
            )}
          </button>
        </form>
      </div>
    );
  }
  
  // Setup in progress (QR code shown)
  if (secretData && secretData.qrCode && secretData.secret) {
    return (
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="space-y-4"
      >
        <div className="flex items-center">
          <ShieldAlert className="h-5 w-5 text-amber-500 mr-2" />
          <h4 className="font-medium text-gray-800 dark:text-white">Set Up Two-Factor Authentication</h4>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              1. Scan this QR code with your authenticator app
            </h5>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-white p-3 rounded-lg shadow-md">
                {/* QR Code image */}
                <img 
                  src={secretData.qrCode} 
                  alt="QR Code for 2FA" 
                  width={180} 
                  height={180} 
                  className="w-[180px] h-[180px]"
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <span>Secret Key</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-1.5 text-gray-500 dark:text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[220px] text-xs">
                            If you can't scan the QR code, enter this secret key manually in your authenticator app.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <input
                    type="text"
                    value={secretData.secret}
                    readOnly
                    className="w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 dark:text-white cursor-text font-mono"
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
                
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p>We recommend using one of these apps:</p>
                  <ul className="list-disc list-inside text-xs mt-1 text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Google Authenticator</li>
                    <li>Microsoft Authenticator</li>
                    <li>Authy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              2. Enter the 6-digit code from your app
            </h5>
            
            <form onSubmit={handleEnable2FA} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={token}
                  onChange={handleTokenChange}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-900 dark:text-white text-center text-xl tracking-widest"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={token.length !== 6 || verifyAndEnableMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {verifyAndEnableMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Verify and Enable
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelSetup}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Initial state (not enabled)
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <ShieldAlert className="h-5 w-5 text-amber-500 mr-2" />
        <h4 className="font-medium text-gray-800 dark:text-white">Two-Factor Authentication</h4>
        <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
          Disabled
        </span>
      </div>
      
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add an extra layer of security to your account by enabling two-factor authentication.
          When enabled, you'll be required to enter both your password and an authentication code
          from your mobile phone to sign in.
        </p>
      </div>
      
      <button
        onClick={handleGenerateQR}
        disabled={generateSecretMutation.isPending}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {generateSecretMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            <Shield className="h-4 w-4 mr-1.5" />
            Set up 2FA
          </>
        )}
      </button>
    </div>
  );
};

export default TwoFactorAuth;