import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyRestaurant } from "../api/restaurantApi";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import type { Restaurant } from "../types/restaurant.types";

export const useFetchRestaurant = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<
    { restaurant: Restaurant; token?: string; message: string },
    AxiosError<{ message: string }>
  >({
    queryKey: ["restaurant"],
    queryFn: fetchMyRestaurant,
    enabled: !!localStorage.getItem("token"),
    retry: false,
  });

  if (data?.token) {
    localStorage.setItem("token", data.token);
    queryClient.invalidateQueries({ queryKey: ["authUser"] });
  }

  if (isError && axios.isAxiosError(error)) {
    toast.error(error.response?.data?.message ?? "Failed to fetch restaurant");
  }

  return {
    restaurant: data?.restaurant,
    isLoading,
    isError,
  };
};