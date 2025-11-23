import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/types";
import { queryClient } from "./react-query-provider";
import { useLocation, useNavigate } from "react-router";
import { publicRoutes } from "@/lib";
import { toast } from "sonner";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    const currentPath = useLocation().pathname;
    const isPublicRoute = publicRoutes.includes(currentPath);

    // check if user is authenticated
    useEffect(() => {
        const checkAuth = async () => {
            const userInfo = localStorage.getItem("user");
            if (userInfo) {
                setUser(JSON.parse(userInfo)); 
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                if (!isPublicRoute) {
                    navigate("/sign-in");
                }
            }
            setIsLoading(false);
        };
        
        checkAuth();
    }, []);

    useEffect(() => {
        const handleLogout = () => {
            // Clear all localStorage
            localStorage.clear();
            
            setUser(null);
            setIsAuthenticated(false);
            queryClient.clear();
            
            // Show notification
            toast.error("Session expired. Please sign in again.");
            
            // Navigate to sign-in
            navigate("/sign-in");
        };
        
        const handleUserUpdate = (event: any) => {
            const userInfo = localStorage.getItem("user");
            if (userInfo) {
                const updatedUser = JSON.parse(userInfo);
                setUser(updatedUser);
            }
        };
        
        window.addEventListener("force-logout", handleLogout);
        window.addEventListener("user-updated", handleUserUpdate);
        
        return () => {
            window.removeEventListener("force-logout", handleLogout);
            window.removeEventListener("user-updated", handleUserUpdate);
        };
    }, [navigate]);

    const login = async (data: any) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setUser(data.user);
        setIsAuthenticated(true);
    };
    
    const logout = async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setIsAuthenticated(false);

        queryClient.clear();
    };
    
    const values = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
    };
    return (
    <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};