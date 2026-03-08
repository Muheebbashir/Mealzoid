import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addRole } from "../api/userApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import type { Role } from "../types/Role.types";

export const useAddRole = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { token: string },
    AxiosError<{ message: string }>,
    Role
  >({
    mutationFn: (role: Role) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      return addRole(role, token);
    },

    onSuccess: (data) => {
      localStorage.setItem("token", data.token);

      queryClient.invalidateQueries({ queryKey: ["authUser"] });

      toast.success("Role set successfully!");
      navigate("/");
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to set role");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    addRole: mutate,
    isLoading: isPending,
  };
};
