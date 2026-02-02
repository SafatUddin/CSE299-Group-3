import { Header } from "@/components/layout/header";
import { SidebarComponent } from "@/components/layout/sidebar-component";
import { Loader } from "@/components/loader";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";

const DashboardLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
    const [isCurrentWorkspace, setIsCurrentWorkspace] = useState<Workspace | null>(null);
    const location = useLocation();
    
    // Only fetch workspaces when authenticated
    const { data: workspaceData } = useGetWorkspacesQuery() as { data: Workspace[] | undefined };

    // Reset workspace selection when navigating to dashboard or workspace list
    useEffect(() => {
        if (location.pathname === '/dashboard' || location.pathname === '/workspace') {
            setIsCurrentWorkspace(null);
        }
    }, [location.pathname]);

    
    if (isLoading) {
        return <div><Loader /></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/sign-in" replace />;
    }

    const handleWorkspaceSelected = (workspace: Workspace) => {
        setIsCurrentWorkspace(workspace);
    };
    
    return (
      <div className="flex h-screen w-full overflow-x-hidden">
        <SidebarComponent currentWorkspace={isCurrentWorkspace} />

        <div className="flex flex-1 flex-col h-full min-w-0">
          <Header
            onWorkspaceSelected={handleWorkspaceSelected}
            selectedWorkspace={isCurrentWorkspace}
            onCreateWorkspace={() => setIsCreatingWorkspace(true)}
            workspaceData={workspaceData}
          />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden h-full w-full">
            <div className="mx-auto container px-2 sm:px-6 lg:px-8 py-0 md:py-8 w-full h-full">
              <Outlet />
            </div>
          </main>
        </div>
        <CreateWorkspace
          isCreatingWorkspace={isCreatingWorkspace}
          setIsCreatingWorkspace={setIsCreatingWorkspace}
        />
      </div>
    );
};
export default DashboardLayout;