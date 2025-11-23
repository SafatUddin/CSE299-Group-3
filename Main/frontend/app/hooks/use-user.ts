import { fetchData, updateData, deleteData } from "@/lib/fetch-util";
import type {
  ChangePasswordFormData,
  ProfileFormData,
} from "@/routes/user/profile";
import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";

const queryKey: QueryKey = ["user"];

export const useUserProfileQuery = () => {
  return useQuery({
    queryKey,
    queryFn: () => fetchData("/users/profile"),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      updateData("/users/change-password", data),
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProfileFormData) => updateData("/users/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload profile picture');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update user in localStorage
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        user.profilePicture = data.user.profilePicture;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Dispatch custom event to update AuthContext
      window.dispatchEvent(new CustomEvent('user-updated', { 
        detail: { profilePicture: data.user.profilePicture } 
      }));
      
      // Invalidate all queries that might display the user
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      
      // Force refetch to ensure fresh data
      queryClient.refetchQueries({ queryKey: ["workspace"] });
      queryClient.refetchQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useDeleteProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteData("/users/profile-picture"),
    onSuccess: (data) => {
      // Update user in localStorage
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        user.profilePicture = null;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Dispatch custom event to update AuthContext
      window.dispatchEvent(new CustomEvent('user-updated', { 
        detail: { profilePicture: null } 
      }));
      
      // Invalidate all queries that might display the user
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      
      // Force refetch to ensure fresh data
      queryClient.refetchQueries({ queryKey: ["workspace"] });
      queryClient.refetchQueries({ queryKey: ["workspaces"] });
    },
  });
};
