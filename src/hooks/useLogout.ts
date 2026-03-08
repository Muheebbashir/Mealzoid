import { useQueryClient } from "@tanstack/react-query";
import { disconnectSocket } from "../lib/socket";

export const useLogout = () => {
  const queryClient = useQueryClient();

  const logout = () => {
    // Clear token
    localStorage.removeItem("token");
    
    // Disconnect socket
    disconnectSocket();
    
    // Clear all React Query cache
    queryClient.clear();
    
    // Force full page reload to login
    window.location.href = "/login";
  };

  return { logout };
};