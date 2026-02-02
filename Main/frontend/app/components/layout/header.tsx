import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";
import { useEffect } from "react";
import { NotificationDropdown } from "./notification-dropdown";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
  selectedWorkspace: Workspace | null;
  onCreateWorkspace: () => void;
  workspaceData: Workspace[] | undefined;
}

export const Header = ({
  onWorkspaceSelected,
  selectedWorkspace,
  onCreateWorkspace,
  workspaceData,
}: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const { user, logout } = useAuth();
  const workspace = workspaceData || [];
  
  // Extract workspaceId from URL if present
  const workspaceIdFromUrl = params.workspaceId || location.pathname.split('/')[2];
  
  // Reset workspace selection on archived, settings, and my-tasks pages
  useEffect(() => {
    if (location.pathname === '/archived' || location.pathname === '/settings' || location.pathname === '/my-tasks') {
      onWorkspaceSelected(null as any);
    }
  }, [location.pathname, onWorkspaceSelected]);
  
  // Find workspace from URL if not already selected
  useEffect(() => {
    if (workspaceIdFromUrl && (!selectedWorkspace || selectedWorkspace._id !== workspaceIdFromUrl)) {
      const workspaceFromUrl = workspace?.find(ws => ws._id === workspaceIdFromUrl);
      if (workspaceFromUrl) {
        onWorkspaceSelected(workspaceFromUrl);
      }
    }
  }, [workspaceIdFromUrl, workspace, selectedWorkspace, onWorkspaceSelected]);

  const handleOnClick = (workspace: Workspace) => {
    onWorkspaceSelected(workspace);
    navigate(`/workspace/${workspace._id}`);
  };

  return (
    <div className="bg-background sticky top-0 z-40 border-b">
      <div className="flex h-12 items-center justify-between px-2 py-2 gap-2 min-w-0">
        <div className="flex-shrink min-w-0 max-w-[45%] sm:max-w-none sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} className="text-sm w-full sm:w-auto min-w-0">
                {selectedWorkspace ? (
                  <div className="flex items-center gap-1.5 min-w-0 w-full">
                    {selectedWorkspace.color && (
                      <div className="flex-shrink-0">
                        <WorkspaceAvatar
                          color={selectedWorkspace.color}
                          name={selectedWorkspace.name}
                        />
                      </div>
                    )}
                    <span className="font-medium truncate text-xs sm:text-sm">{selectedWorkspace?.name}</span>
                  </div>
                ) : (
                  <span className="font-medium text-xs sm:text-sm">Select Workspace</span>
                )}
              </Button>
            </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {workspace && workspace.length > 0 ? (
                workspace.map((ws) => (
                  <DropdownMenuItem
                    key={ws._id}
                    onClick={() => handleOnClick(ws)}
                  >
                    {ws.color && (
                      <WorkspaceAvatar color={ws.color} name={ws.name} />
                    )}
                    <span className="ml-2">{ws.name}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  No workspace available
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onCreateWorkspace}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Workspace
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <ThemeToggle />
          <NotificationDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full border p-0 w-8 h-8 overflow-hidden flex-shrink-0">
                <Avatar className="w-full h-full" key={user?.profilePicture || 'no-picture'}>
                  {user?.profilePicture && (
                    <AvatarImage
                      src={`${import.meta.env.VITE_API_URL.replace('/api-v1', '')}${user.profilePicture}`}
                      alt={user.name}
                    />
                  )}
                  <AvatarFallback className="bg-gray-900 text-white dark:bg-gray-800 font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/user/profile" className="cursor-pointer">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};