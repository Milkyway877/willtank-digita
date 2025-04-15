import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient
} from "@tanstack/react-query";
import { Will } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type WillsContextType = {
  wills: Will[] | null;
  isLoading: boolean;
  error: Error | null;
  getWill: (id: number) => Will | undefined;
  createWillMutation: UseMutationResult<Will, Error, Partial<Will>>;
  updateWillMutation: UseMutationResult<Will, Error, { id: number; data: Partial<Will> }>;
  deleteWillMutation: UseMutationResult<void, Error, number>;
};

export const WillsContext = createContext<WillsContextType | null>(null);

export function WillsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    data: wills,
    error,
    isLoading,
  } = useQuery<Will[], Error>({
    queryKey: ["/api/wills"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/wills");
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch wills");
      }
      
      return await res.json();
    },
  });

  const getWill = (id: number) => {
    return wills?.find(will => will.id === id);
  };

  const createWillMutation = useMutation({
    mutationFn: async (data: Partial<Will>) => {
      const res = await apiRequest("POST", "/api/wills", data);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create will");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wills"] });
      toast({
        title: "Success",
        description: "Will created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateWillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Will> }) => {
      const res = await apiRequest("PUT", `/api/wills/${id}`, data);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update will");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wills"] });
      toast({
        title: "Success",
        description: "Will updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteWillMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/wills/${id}`);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete will");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wills"] });
      toast({
        title: "Success",
        description: "Will deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <WillsContext.Provider
      value={{
        wills: wills || null,
        isLoading,
        error,
        getWill,
        createWillMutation,
        updateWillMutation,
        deleteWillMutation,
      }}
    >
      {children}
    </WillsContext.Provider>
  );
}

export function useWills() {
  const context = useContext(WillsContext);
  if (!context) {
    throw new Error("useWills must be used within a WillsProvider");
  }
  return context;
}