import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addMenuItem, getAllMenuItems, deleteMenuItem, toggleMenuItemAvailability } from "../api/menuItemApi";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import type { MenuItem } from "../types/menuItem.types";

export const useAddMenuItem = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: addMenuItem,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      toast.success(data.message);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to add menu item");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    addMenuItem: mutate,
    isLoading: isPending,
  };
};

export const useGetMenuItems = (restaurantId: string) => {
  const { data, isLoading, isError } = useQuery<{ items: MenuItem[] }>({
    queryKey: ["menuItems", restaurantId],
    queryFn: () => getAllMenuItems(restaurantId),
    enabled: !!restaurantId,
  });

  return {
    items: data?.items ?? [],
    isLoading,
    isError,
  };
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { message: string },
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: deleteMenuItem,
    onSuccess: (data: { message: string }) => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      toast.success(data.message);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to delete menu item");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    deleteMenuItem: mutate,
    isLoading: isPending,
  };
};

export const useToggleMenuItemAvailability = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { item: MenuItem; message: string },
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: toggleMenuItemAvailability,
    onSuccess: (data: { item: MenuItem; message: string }) => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      toast.success(data.message);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to toggle availability");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    toggleAvailability: mutate,
    isLoading: isPending,
  };
};