import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptOrder, createRiderProfile, fetchAvailableOrdersForRider, fetchMyCurrentOrder, fetchMyRiderProfile, toggleRiderAvailability, updateOrderStatusByRider } from "../api/riderApi";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import type { Rider } from "../types/rider.types";
import type { Order } from "../types/order.types";

export const useCreateRiderProfile = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { message: string; riderProfile: Rider },
    AxiosError<{ message: string }>,
    FormData
  >({
    mutationFn: createRiderProfile,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["riderProfile"] });
      toast.success(data.message);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to create profile");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    createProfile: mutate,
    isLoading: isPending,
  };
};

export const useMyRiderProfile = () => {
  const { data, isLoading, error } = useQuery<{ account: Rider }>({
    queryKey: ["riderProfile"],
    queryFn: fetchMyRiderProfile,
    enabled: !!localStorage.getItem("token"),
  });

  return {
    profile: data?.account,
    isLoading,
    error,
  };
};

export const useToggleRiderAvailability = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { message: string; rider: Rider },
    AxiosError<{ message: string }>,
    { isAvailable: boolean; latitude: number; longitude: number }
  >({
    mutationFn: ({ isAvailable, latitude, longitude }) =>
      toggleRiderAvailability(isAvailable, latitude, longitude),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["riderProfile"] });
      toast.success(data.message);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to update availability");
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

export const useAcceptOrder = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { message: string },
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: acceptOrder,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["riderProfile"] });
      queryClient.invalidateQueries({ queryKey: ["currentOrder"] });
      toast.success(data.message);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to accept order");
        // Remove the order from the visible list — it may have been taken by someone else
        queryClient.invalidateQueries({ queryKey: ["availableOrders"] });
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    acceptOrder: mutate,
    isLoading: isPending,
  };
};

export const useCurrentOrder = () => {
  const { data, isLoading, error } = useQuery<{ order: Order | null }>({
    queryKey: ["currentOrder"],
    queryFn: fetchMyCurrentOrder,
    enabled: !!localStorage.getItem("token"),
    // No polling — mutations (acceptOrder, updateStatus) and socket "order:your_delivery" handle updates.
    staleTime: Infinity,
  });

  return {
    currentOrder: data?.order,
    isLoading,
    error,
  };
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { message: string },
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: updateOrderStatusByRider,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["currentOrder"] });
      toast.success(data.message);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to update order");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    updateStatus: mutate,
    isLoading: isPending,
  };
};

export const useAvailableOrders = (enabled: boolean) => {
  const { data, isLoading } = useQuery({
    queryKey: ["availableOrders"],
    queryFn: fetchAvailableOrdersForRider,
    enabled,
    // No polling — socket event "order:available" triggers invalidation.
    staleTime: Infinity,
  });

  return {
    availableOrders: data?.orders ?? [],
    isLoading,
  };
};