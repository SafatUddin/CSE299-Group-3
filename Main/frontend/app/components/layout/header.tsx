import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { Button } from "../ui/button";
import { Bell, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";
import { useEffect } from "react";

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
  
  // Reset workspace selection on archived and settings pages
  useEffect(() => {
    if (location.pathname === '/archived' || location.pathname === '/settings') {
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
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"}>
              {selectedWorkspace ? (
                <>
                  {selectedWorkspace.color && (
                    <WorkspaceAvatar
                      color={selectedWorkspace.color}
                      name={selectedWorkspace.name}
                    />
                  )}
                  <span className="font-medium">{selectedWorkspace?.name}</span>
                </>
              ) : (
                <span className="font-medium">Select Workspace</span>
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

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full border p-0 w-10 h-10 overflow-hidden">
                <Avatar className="w-full h-full">
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