import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  getPendingRestaurants,
  getPendingRiders,
  verifyRestaurant,
  verifyRider,
} from "../api/adminApi";
import toast from "react-hot-toast";

export const usePendingRestaurants = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pendingRestaurants"],
    queryFn: getPendingRestaurants,
  });

  return {
    restaurants: data?.restaurants ?? [],
    count: data?.count ?? 0,
    isLoading,
    error,
  };
};

export const usePendingRiders = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pendingRiders"],
    queryFn: getPendingRiders,
  });

  return {
    riders: data?.riders ?? [],
    count: data?.count ?? 0,
    isLoading,
    error,
  };
};

export const useVerifyRestaurant = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => verifyRestaurant(id),
    onSuccess: () => {
      toast.success("Restaurant verified!");
      queryClient.invalidateQueries({ queryKey: ["pendingRestaurants"] });
    },
    onError: () => {
      toast.error("Failed to verify restaurant");
    },
  });

  return { verifyRestaurant: mutate, isPending };
};

export const useVerifyRider = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => verifyRider(id),
    onSuccess: () => {
      toast.success("Rider verified!");
      queryClient.invalidateQueries({ queryKey: ["pendingRiders"] });
    },
    onError: () => {
      toast.error("Failed to verify rider");
    },
  });

  return { verifyRider: mutate, isPending };
};
