import { createContext, useContext, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Types
interface TwoFactorSecret {
  secret: string;
  qrCode: string;
  otpAuthUrl: string;
}

interface TwoFactorStatus {
  enabled: boolean;
  hasTwoFactorSecret: boolean;
}

interface TwoFactorContext {
  // Status
  status: TwoFactorStatus | undefined;
  isLoading: boolean;
  isError: boolean;
  
  // Mutations
  generateSecretMutation: any;
  verifyAndEnableMutation: any;
  disableMutation: any;
  verifyTokenMutation: any;
  
  // Helpers
  clearSecret: () => void;
}

// Context
const TwoFactorContext = createContext<TwoFactorContext | null>(null);

export function TwoFactorProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get 2FA status
  const { 
    data: status,
    isLoading,
    isError,
  } = useQuery<TwoFactorStatus>({
    queryKey: ['/api/2fa/status'],
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  // Generate new secret
  const generateSecretMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/2fa/generate');
      return res.json();
    },
    onSuccess: (data: TwoFactorSecret) => {
      // Store secret in query cache for later use
      queryClient.setQueryData(['/api/2fa/secret'], data);
      toast({
        title: 'Secret Generated',
        description: 'Scan the QR code with your authenticator app.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to generate secret',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Verify token and enable 2FA
  const verifyAndEnableMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await apiRequest('POST', '/api/2fa/verify', { token });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to verify 2FA token');
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate status
      queryClient.invalidateQueries({ queryKey: ['/api/2fa/status'] });
      // Clear secret from cache
      queryClient.removeQueries({ queryKey: ['/api/2fa/secret'] });
      
      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been successfully enabled.',
        variant: 'default',
      });
      
      // If backup codes are returned, store them
      if (data.backupCodes) {
        queryClient.setQueryData(['/api/2fa/backupCodes'], data.backupCodes);
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify token. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Disable 2FA
  const disableMutation = useMutation({
    mutationFn: async ({ password, token }: { password: string; token?: string }) => {
      const res = await apiRequest('POST', '/api/2fa/disable', { password, token });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate status
      queryClient.invalidateQueries({ queryKey: ['/api/2fa/status'] });
      
      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to disable 2FA',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Verify token
  const verifyTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await apiRequest('POST', '/api/2fa/verify-token', { token });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        toast({
          title: 'Verification Successful',
          description: 'Token is valid.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Verification Failed',
          description: 'Invalid token.',
          variant: 'destructive',
        });
      }
      return data.valid;
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    },
  });
  
  // Helper to clear secret from cache
  const clearSecret = () => {
    queryClient.removeQueries({ queryKey: ['/api/2fa/secret'] });
  };
  
  return (
    <TwoFactorContext.Provider
      value={{
        status,
        isLoading,
        isError,
        generateSecretMutation,
        verifyAndEnableMutation,
        disableMutation,
        verifyTokenMutation,
        clearSecret,
      }}
    >
      {children}
    </TwoFactorContext.Provider>
  );
}

export function use2FA() {
  const context = useContext(TwoFactorContext);
  if (!context) {
    throw new Error('use2FA must be used within a TwoFactorProvider');
  }
  return context;
}