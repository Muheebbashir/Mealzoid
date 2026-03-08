import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addAddress, getMyAddresses, deleteAddress } from "../api/addressApi";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import type { Address } from "../types/address.types";

export const useAddAddress = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { message: string; address: Address },
    AxiosError<{ message: string }>,
    { mobile: number; formattedAddress: string; latitude: number; longitude: number }
  >({
    mutationFn: ({ mobile, formattedAddress, latitude, longitude }) =>
      addAddress(mobile, formattedAddress, latitude, longitude),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success(data.message);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to add address");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    addAddress: mutate,
    isLoading: isPending,
  };
};

export const useMyAddresses = () => {
  const { data, isLoading, error } = useQuery<{ addresses: Address[] }>({
    queryKey: ["addresses"],
    queryFn: getMyAddresses,
    enabled: !!localStorage.getItem("token"),
  });

  return {
    addresses: data?.addresses ?? [],
    isLoading,
    error,
  };
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { message: string },
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: deleteAddress,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success(data.message);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to delete address");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    deleteAddress: mutate,
    isLoading: isPending,
  };
};