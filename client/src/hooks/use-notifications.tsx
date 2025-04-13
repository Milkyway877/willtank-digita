import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsReadMutation: ReturnType<typeof useMarkAsReadMutation>;
  markAllAsReadMutation: ReturnType<typeof useMarkAllAsReadMutation>;
  deleteNotificationMutation: ReturnType<typeof useDeleteNotificationMutation>;
};

const NotificationsContext = createContext<NotificationsContextType | null>(null);

// Custom hook for mark as read mutation
function useMarkAsReadMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await apiRequest("POST", `/api/notifications/mark-read/${notificationId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });
}

// Custom hook for mark all as read mutation
function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/notifications/mark-all-read");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });
}

// Custom hook for delete notification mutation
function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await apiRequest("DELETE", `/api/notifications/${notificationId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch notifications
  const {
    data: notifications = [],
    error,
    isLoading,
  } = useQuery<Notification[], Error>({
    queryKey: ["/api/notifications"],
    queryFn: getQueryFn(),
    enabled: !!user,
  });

  // Fetch unread count
  const {
    data: unreadCountData,
    isLoading: isUnreadCountLoading,
  } = useQuery<{ count: number }, Error>({
    queryKey: ["/api/notifications/unread-count"],
    queryFn: getQueryFn(),
    enabled: !!user,
  });

  const unreadCount = unreadCountData?.count || 0;

  // Set up mutation hooks
  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const deleteNotificationMutation = useDeleteNotificationMutation();

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading: isLoading || isUnreadCountLoading,
        error,
        markAsReadMutation,
        markAllAsReadMutation,
        deleteNotificationMutation,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}