import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import React from "react";
import {Toaster} from "sonner";
import { AuthProvider } from "./auth-context";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      staleTime: 3 * 60 * 1000, // 3 minutes - reduced for fresher data
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

const ReactQueryProvider = (( { children }: { children: React.ReactNode }) => {
    return (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            {children}
            <Toaster position="top-center" richColors />
        </AuthProvider>
    </QueryClientProvider>
    );
});



export default ReactQueryProvider;