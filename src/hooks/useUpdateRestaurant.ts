import { useMutation } from "@tanstack/react-query";
import { updateRestaurantStatus, updateRestaurantDetails } from "../api/restaurantApi";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import type { Restaurant } from "../types/restaurant.types";

export const useUpdateRestaurantStatus = () => {
  const { mutate, isPending } = useMutation<
    { restaurant: Restaurant; message: string },
    AxiosError<{ message: string }>,
    boolean
  >({
    mutationFn: updateRestaurantStatus,

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to update status");
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

export const useUpdateRestaurantDetails = () => {
  const { mutate, isPending } = useMutation<
    { restaurant: Restaurant; message: string },
    AxiosError<{ message: string }>,
    { name: string; description: string }
  >({
    mutationFn: updateRestaurantDetails,

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to update restaurant");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    updateDetails: mutate,
    isLoading: isPending,
  };
};