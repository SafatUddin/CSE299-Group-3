import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData, updateData, deleteData } from "@/lib/fetch-util";
import type { Notification } from "@/types";

interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

interface NotificationsResponse {
  notifications: Notification[];
  totalPages: number;
  currentPage: number;
  totalNotifications: number;
}

interface UnreadCountResponse {
  count: number;
}

export const useGetNotifications = (params: GetNotificationsParams = {}) => {
  const { page = 1, limit = 10, unreadOnly = false } = params;

  return useQuery({
    queryKey: ["notifications", page, limit, unreadOnly],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(unreadOnly && { unreadOnly: "true" }),
      });

      const response = await fetchData<NotificationsResponse>(
        `/notifications?${queryParams.toString()}`
      );
      return response;
    },
    refetchInterval: 2000, // Refetch every 2 seconds for near real-time updates
  });
};

export const useGetUnreadCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await fetchData<UnreadCountResponse>(
        "/notifications/unread-count"
      );
      return response.count;
    },
    refetchInterval: 2000, // Refetch every 2 seconds for near real-time updates
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await updateData<Notification>(
        `/notifications/${notificationId}/read`,
        {}
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await updateData<{ message: string; modifiedCount: number }>(
        "/notifications/mark-all-read",
        {}
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await deleteData<{ message: string }>(
        `/notifications/${notificationId}`
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
