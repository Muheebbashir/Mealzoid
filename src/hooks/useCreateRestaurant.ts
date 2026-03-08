import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRestaurant } from "../api/restaurantApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import type { Restaurant } from "../types/restaurant.types";

export const useCreateRestaurant = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { restaurant: Restaurant; token?: string },
    AxiosError<{ message: string }>,
    FormData
  >({
    mutationFn: createRestaurant,

    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }

      queryClient.invalidateQueries({ queryKey: ["restaurant"] });

      toast.success("Restaurant created successfully!");
      navigate("/restaurant");
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to create restaurant");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    createRestaurant: mutate,
    isLoading: isPending,
  };
};