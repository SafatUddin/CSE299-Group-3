import { Button } from "@/components/ui/button";
import { useAuth } from "@/provider/auth-context";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const DashboardLayout = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Protect dashboard - redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/sign-in", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading or nothing while checking auth
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
};

export default DashboardLayout;