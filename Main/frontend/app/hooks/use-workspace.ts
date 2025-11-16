import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { fetchData, postData, updateData, deleteData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateWorkspace = () => {
  return useMutation({
    mutationFn: async (data: WorkspaceForm) => postData("/workspace", data),
  });
};

export const useGetWorkspacesQuery = () => {
  return useQuery({
    queryKey: ["workspace"],
    queryFn: async () => fetchData("/workspace"),
  });
};

export const useGetOverallStatsQuery = () => {
  return useQuery({
    queryKey: ["workspace", "overall-stats"],
    queryFn: async () => fetchData(`/workspace/overall-stats`),
    staleTime: 5 * 60 * 1000, // 5 minutes - dashboard data doesn't change that often
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });
};

export const useGetWorkspaceById = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => fetchData(`/workspace/${workspaceId}/projects`),
  });
};

export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "details"],
    queryFn: async () => fetchData(`/workspace/${workspaceId}`),
    enabled: !!workspaceId,
  });
};

export const useInviteMemberMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string; role: string; workspaceId: string }) =>
      postData(`/workspace/${data.workspaceId}/invite-member`, data),
  });
};

export const useAcceptInviteByTokenMutation = () => {
  return useMutation({
    mutationFn: (token: string) =>
      postData(`/workspace/accept-invite-token`, {
        token,
      }),
  });
};

export const useAcceptGenerateInviteMutation = () => {
  return useMutation({
    mutationFn: (workspaceId: string) =>
      postData(`/workspace/${workspaceId}/accept-generate-invite`, {}),
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      workspaceId: string;
      workspaceData: WorkspaceForm;
    }) => updateData(`/workspace/${data.workspaceId}`, data.workspaceData),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", data._id],
      });
    },
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspaceId: string) =>
      deleteData(`/workspace/${workspaceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace"],
      });
    },
  });
};

export const useTransferOwnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { workspaceId: string; newOwnerId: string }) =>
      postData(`/workspace/${data.workspaceId}/transfer-ownership`, {
        newOwnerId: data.newOwnerId,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", data._id],
      });
    },
  });
};