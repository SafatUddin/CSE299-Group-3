import type { CreateTaskFormData } from "@/components/task/create-task-dialog";
import { fetchData, postData, updateData } from "@/lib/fetch-util";
import type { TaskPriority, TaskStatus } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; taskData: CreateTaskFormData }) =>
      postData(`/tasks/${data.projectId}/create-task`, data.taskData),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["project", data.project],
      });
    },
  });
};

export const useTaskByIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => fetchData(`/tasks/${taskId}`),
    retry: (failureCount, error: any) => {
      // Don't retry on 403 (forbidden) errors
      if (error?.response?.status === 403) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
  });
};

export const useUpdateTaskTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
      updateData(`/tasks/${data.taskId}/title`, { title: data.title }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; status: TaskStatus }) =>
      updateData(`/tasks/${data.taskId}/status`, { status: data.status }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateTaskDescriptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; description: string }) =>
      updateData(`/tasks/${data.taskId}/description`, {
        description: data.description,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateTaskAssigneesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; assignees: string[] }) =>
      updateData(`/tasks/${data.taskId}/assignees`, {
        assignees: data.assignees,
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateTaskPriorityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; priority: TaskPriority }) =>
      updateData(`/tasks/${data.taskId}/priority`, { priority: data.priority }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useAddSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
      postData(`/tasks/${data.taskId}/add-subtask`, { title: data.title }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useUpdateSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      taskId: string;
      subTaskId: string;
      completed: boolean;
    }) =>
      updateData(`/tasks/${data.taskId}/update-subtask/${data.subTaskId}`, {
        completed: data.completed,
      }),
    // Optimistic update for instant UI feedback
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["task", variables.taskId] });

      // Snapshot the previous value
      const previousTask = queryClient.getQueryData(["task", variables.taskId]);

      // Optimistically update to the new value
      queryClient.setQueryData(["task", variables.taskId], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          task: {
            ...old.task,
            subtasks: old.task.subtasks.map((st: any) =>
              st._id === variables.subTaskId
                ? { ...st, completed: variables.completed }
                : st
            ),
          },
        };
      });

      // Return context with the previous value
      return { previousTask };
    },
    // If mutation fails, rollback to previous value
    onError: (err, variables, context: any) => {
      if (context?.previousTask) {
        queryClient.setQueryData(["task", variables.taskId], context.previousTask);
      }
    },
    // Always refetch after error or success to ensure data is in sync
    onSettled: (data: any) => {
      if (data?._id) {
        queryClient.invalidateQueries({
          queryKey: ["task", data._id],
        });
        queryClient.invalidateQueries({
          queryKey: ["task-activity", data._id],
        });
      }
    },
  });
};

export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; text: string }) =>
      postData(`/tasks/${data.taskId}/add-comment`, { text: data.text }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", data.task],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data.task],
      });
    },
  });
};

export const useGetCommentsByTaskIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => fetchData(`/tasks/${taskId}/comments`),
  });
};

export const useWatchTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/tasks/${data.taskId}/watch`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useAchievedTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string }) =>
      postData(`/tasks/${data.taskId}/achieved`, {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["task", data._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", data._id],
      });
    },
  });
};

export const useGetMyTasksQuery = () => {
  return useQuery({
    queryKey: ["my-tasks", "user"],
    queryFn: () => fetchData("/tasks/my-tasks"),
  });
};

export const useUploadAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { taskId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", data.file);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/tasks/${data.taskId}/upload-attachment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload file");
      }

      return response.json();
    },
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
    },
  });
};

export const useAddLinkAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; name: string; url: string }) =>
      postData(`/tasks/${data.taskId}/add-link`, {
        name: data.name,
        url: data.url,
      }),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
    },
  });
};

export const useDeleteAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { taskId: string; attachmentId: string }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/tasks/${data.taskId}/attachment/${data.attachmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete attachment");
      }

      return response.json();
    },
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
    },
  });
};