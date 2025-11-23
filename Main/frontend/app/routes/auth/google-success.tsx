import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/provider/auth-context";
import { Loader } from "@/components/loader";
import { toast } from "sonner";

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    
    const handleGoogleAuth = async () => {
      hasProcessed.current = true;
      
      const token = searchParams.get("token");
      const userParam = searchParams.get("user");
      const error = searchParams.get("error");

      if (error) {
        toast.error("Authentication failed. Please try again.");
        navigate("/sign-in");
        return;
      }

      if (token && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          await login({ token, user });
          toast.success("Successfully signed in with Google!");
          navigate("/workspace");
        } catch (error) {
          console.error("Login error:", error);
          toast.error("Failed to complete authentication");
          navigate("/sign-in");
        }
      } else {
        toast.error("Invalid authentication response");
        navigate("/sign-in");
      }
    };

    handleGoogleAuth();
  }, [searchParams, navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader />
        <p className="mt-4 text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
