import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { useGetNotifications, useGetUnreadCount, useMarkAsRead, useMarkAllAsRead } from "@/hooks/use-notification";
import { ScrollArea } from "../ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "../ui/avatar";
import type { Notification } from "@/types";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const NotificationDropdown = () => {
  const { data: unreadCount = 0 } = useGetUnreadCount();
  const { data: notificationsData, isLoading } = useGetNotifications({
    limit: 20,
  });
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const navigate = useNavigate();
  const [navigating, setNavigating] = useState(false);

  const notifications = notificationsData?.notifications || [];

  console.log("Notification dropdown - unread count:", unreadCount);
  console.log("Notification dropdown - notifications:", notifications.length);

  const handleNotificationClick = async (notification: Notification) => {
    if (navigating) return; // Prevent multiple clicks
    
    setNavigating(true);
    
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }

    // Navigate to the resource
    try {
      switch (notification.resourceType) {
        case "Task":
          // For tasks, we need to fetch the task details to get workspace and project IDs
          console.log("Fetching task details for:", notification.resourceId);
          const taskResponse = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${notification.resourceId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const taskData = await taskResponse.json();
          console.log("Task data received:", taskData);
          
          if (taskData.task && taskData.project) {
            const workspaceId = taskData.project.workspace;
            const projectId = taskData.project._id;
            console.log("Navigating to:", `/workspace/${workspaceId}/projects/${projectId}/tasks/${notification.resourceId}`);
            navigate(`/workspace/${workspaceId}/projects/${projectId}/tasks/${notification.resourceId}`);
          }
          break;
        case "Project":
          // For projects, fetch project to get workspace ID
          const projectResponse = await fetch(`${import.meta.env.VITE_API_URL}/projects/${notification.resourceId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const projectData = await projectResponse.json();
          if (projectData.workspace) {
            const workspaceId = typeof projectData.workspace === 'string' ? projectData.workspace : projectData.workspace._id;
            navigate(`/workspace/${workspaceId}/projects/${notification.resourceId}`);
          }
          break;
        case "Workspace":
          if (typeof notification.workspace === 'object') {
            navigate(`/workspace/${notification.workspace._id}`);
          } else {
            navigate(`/workspace/${notification.workspace}`);
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    } finally {
      setNavigating(false);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-1 text-xs"
              disabled={markAllAsReadMutation.isPending}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex gap-3 p-3 cursor-pointer hover:bg-accent transition-colors",
                    !notification.isRead && "bg-blue-50 dark:bg-blue-950/20"
                  )}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {notification.actionBy.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm leading-tight">
                      <span className="font-medium">{notification.actionBy.name}</span>{" "}
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  
                  {!notification.isRead && (
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
