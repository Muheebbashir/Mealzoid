import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart, fetchMyCart, incrementCartItem, decrementCartItem, clearCart } from "../api/cartApi";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import type { CartResponse, CartItem } from "../types/cart.types";

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { message: string; cartItem: CartItem },
    AxiosError<{ message: string }>,
    { restaurantId: string; itemId: string }
  >({
    mutationFn: ({ restaurantId, itemId }) => addToCart(restaurantId, itemId),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(data.message);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to add to cart");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    addToCart: mutate,
    isLoading: isPending,
  };
};

export const useMyCart = () => {
  const { data, isLoading, error } = useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: fetchMyCart,
    enabled: !!localStorage.getItem("token"),
  });

  return {
    cartItems: data?.cartItems ?? [],
    subTotal: data?.subTotal ?? 0,
    cartLength: data?.cartLength ?? 0,
    isLoading,
    error,
  };
};

export const useIncrementCartItem = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { message: string; cartItem: CartItem },
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: incrementCartItem,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to update cart");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    incrementItem: mutate,
    isLoading: isPending,
  };
};

export const useDecrementCartItem = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { message: string; cartItem?: CartItem },
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: decrementCartItem,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to update cart");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    decrementItem: mutate,
    isLoading: isPending,
  };
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { message: string },
    AxiosError<{ message: string }>
  >({
    mutationFn: clearCart,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(data.message);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to clear cart");
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  return {
    clearCart: mutate,
    isLoading: isPending,
  };
};