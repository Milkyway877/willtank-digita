import { QueryClient, QueryFunction } from "@tanstack/react-query";

// ✅ FIXED: Enhanced error handling for better auth experience
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to parse as JSON first
    let errorBody;
    try {
      // Clone the response before trying to read as text to avoid locking it
      const clone = res.clone();
      const textContent = await clone.text();
      
      // Try to parse as JSON
      try {
        errorBody = JSON.parse(textContent);
      } catch {
        // If it's not JSON, use the text directly
        errorBody = textContent || res.statusText;
      }
    } catch (e) {
      // If we can't read the response for some reason, fall back to status text
      errorBody = res.statusText;
    }
    
    // Create a more specific error based on the status code
    if (res.status === 401) {
      throw new Error('Authentication required. Please sign in to continue.');
    } else if (res.status === 403) {
      throw new Error('You do not have permission to access this resource.');
    } else {
      // For other errors, use the response content or a generic message
      const errorMessage = 
        typeof errorBody === 'object' && errorBody !== null && 'error' in errorBody
          ? errorBody.error
          : typeof errorBody === 'string' 
            ? errorBody 
            : `${res.status}: ${res.statusText}`;
            
      throw new Error(errorMessage);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: { noJsonTransform?: boolean }
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!options?.noJsonTransform) {
    await throwIfResNotOk(res);
  }
  return res;
}

// ✅ FIXED: Enhanced query function with better error handling
type UnauthorizedBehavior = "returnNull" | "throw" | "returnDefault";

// Improved query function with better error handling and default values
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  defaultValue?: T;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, defaultValue }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      // Handle authentication errors according to specified behavior
      if (res.status === 401) {
        if (unauthorizedBehavior === "returnNull") {
          return null as any;
        } else if (unauthorizedBehavior === "returnDefault" && defaultValue !== undefined) {
          return defaultValue;
        }
        // Otherwise, proceed with normal error handling
      }
      
      // For other error responses
      await throwIfResNotOk(res);
      
      // If response is successful, parse and return JSON
      return await res.json();
    } catch (error) {
      // Add additional logging for network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error when fetching data:', error);
        
        // For network errors, return default or null if specified
        if (unauthorizedBehavior === "returnDefault" && defaultValue !== undefined) {
          return defaultValue;
        } else if (unauthorizedBehavior === "returnNull") {
          return null as any;
        }
      }
      
      // Rethrow other errors
      throw error;
    }
  };

// ✅ FIXED: More resilient query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute stale time instead of Infinity for better refresh
      retry: (failureCount, error) => {
        // Don't retry auth errors, but retry other errors up to 2 times
        if (error instanceof Error) {
          const message = error.message.toLowerCase();
          // Don't retry auth errors
          if (message.includes('authentication') || message.includes('authorization')) {
            return false;
          }
          // Retry other errors up to 2 times
          return failureCount < 2;
        }
        return false;
      }
    },
    mutations: {
      retry: false
    },
  },
});

// Fixed: removed incompatible event listener setup 
// that was causing "listener is not a function" errors
