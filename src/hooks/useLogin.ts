import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../api/userApi";
import toast from "react-hot-toast";
import axios from "axios";

export const useLogin = () => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: (credential: string) => loginUser(credential),

    // Retry up to 3 times, but only on network errors (ERR_CONNECTION_REFUSED, etc.)
    // Never retry on 4xx/5xx responses so auth errors surface immediately.
    retry: (failureCount, err) => {
      if (axios.isAxiosError(err) && !err.response) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),

    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      toast.success("Login successful!");
      // Full reload so useAuthUser starts fresh with the new token
      // and App renders the correct role page (seller/rider/customer) immediately
      window.location.href = "/";
    },
  });

  return {
    login: mutate,
    isLoading: isPending,
    error,
  };
};