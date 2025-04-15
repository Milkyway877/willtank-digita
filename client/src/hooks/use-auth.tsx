import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Extended User type
interface ExtendedUser {
  id: number;
  username: string;
  password: string;
  isEmailVerified: boolean | null;
  verificationCode: string | null;
  verificationCodeExpiry: Date | null;
  resetPasswordToken: string | null;
  resetPasswordExpiry: Date | null;
  createdAt: Date | null;
  twoFactorEnabled?: boolean;
  requiresTwoFactor?: boolean;
  // Keep for backwards compatibility
  hasCompletedOnboarding?: boolean;
  fullName?: string;
}

type AuthContextType = {
  user: ExtendedUser | null;
  isLoading: boolean;
  error: Error | null;
  refetchUser: () => Promise<any>; // Add function to manually fetch user data
  loginMutation: ReturnType<typeof useLoginMutation>;
  requestLoginCodeMutation: ReturnType<typeof useRequestLoginCodeMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
  verifyEmailMutation: ReturnType<typeof useVerifyEmailMutation>;
  resendVerificationMutation: ReturnType<typeof useResendVerificationMutation>;
  forgotPasswordMutation: ReturnType<typeof useForgotPasswordMutation>;
  resetPasswordMutation: ReturnType<typeof useResetPasswordMutation>;
};

type LoginData = Pick<InsertUser, "username" | "password">;
type LoginWithCodeData = LoginData & { verificationCode: string };
type RequestLoginCodeData = { username: string };
type VerifyEmailData = { email: string; code: string };
type ResendVerificationData = { email: string };
type ForgotPasswordData = { email: string };
type ResetPasswordData = { token: string; password: string };

// Custom hooks for auth operations

// Request login verification code
function useRequestLoginCodeMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: RequestLoginCodeData) => {
      const res = await apiRequest("POST", "/api/request-login-code", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to request login code");
      }
      return await res.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Verification code sent",
        description: response.message || "A verification code has been sent to your email for login.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Login with verification code
function useLoginMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (credentials: LoginWithCodeData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: ExtendedUser) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Extract email from username (which is email)
      const emailParts = user.username.split('@');
      const displayName = emailParts[0] || user.username;
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${displayName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

function useRegisterMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }
      return await res.json();
    },
    onSuccess: (response: { id: number; username: string; isEmailVerified: boolean; message: string }) => {
      // Don't set as current user yet - they need to verify email first
      toast({
        title: "Registration successful",
        description: response.message || "Please check your email for verification code.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
}

function useVerifyEmailMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: VerifyEmailData) => {
      const res = await apiRequest("POST", "/api/verify-email", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Email verification failed");
      }
      return await res.json();
    },
    onSuccess: (user: ExtendedUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

function useResendVerificationMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: ResendVerificationData) => {
      const res = await apiRequest("POST", "/api/resend-verification", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to resend verification code");
      }
      return await res.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Verification code sent",
        description: response.message || "A new verification code has been sent to your email.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to resend code",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

function useForgotPasswordMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const res = await apiRequest("POST", "/api/forgot-password", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to process password reset request");
      }
      return await res.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Password reset email sent",
        description: response.message || "Check your email for password reset instructions.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

function useResetPasswordMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const res = await apiRequest("POST", "/api/reset-password", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to reset password");
      }
      return await res.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Password reset successful",
        description: response.message || "Your password has been successfully reset.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

function useLogoutMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}



export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Disable auto-login by setting enabled to false by default
  // We'll only fetch when explicitly requested after login/register
  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery<ExtendedUser | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: false, // Disable auto-fetching on page load
  });

  const loginMutation = useLoginMutation();
  const requestLoginCodeMutation = useRequestLoginCodeMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const verifyEmailMutation = useVerifyEmailMutation();
  const resendVerificationMutation = useResendVerificationMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  // Function to manually fetch user data
  const refetchUser = async () => {
    return refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        refetchUser,
        loginMutation,
        requestLoginCodeMutation,
        logoutMutation,
        registerMutation,
        verifyEmailMutation,
        resendVerificationMutation,
        forgotPasswordMutation,
        resetPasswordMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}