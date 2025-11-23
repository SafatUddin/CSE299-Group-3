import type { CreateProjectFormData } from "@/components/project/create-project";
import { fetchData, postData, updateData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const UseCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
        projectData: CreateProjectFormData;
         workspaceId: string 
    }) =>
      postData(
        `/projects/${data.workspaceId}/create-project`,
        data.projectData
        ),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", data.workspace],
      });
    },
  });
};

export const UseProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchData(`/projects/${projectId}/tasks`),
    refetchInterval: 3000, // Refetch every 3 seconds for real-time task updates across users
    refetchIntervalInBackground: true, // Continue refetching even when window is not focused
  });
};

export const UseUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectId: string;
      projectData: CreateProjectFormData;
      workspaceId: string;
    }) => updateData(`/projects/${data.projectId}`, data.projectData),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
    },
  });
};