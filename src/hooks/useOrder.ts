import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  createRazorpayOrder,
  getMyOrders,
  getRestaurantOrders,
  getSingleOrder,
  updateOrderStatus,
  verifyRazorpayPayment,
} from "../api/OrderApi";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import type { Order } from "../types/order.types";

/* ============================= */
/*        CREATE ORDER HOOK      */
/* ============================= */

export const useCreateOrder = () => {
  const { mutate, isPending } = useMutation<
    { message: string; orderId: string; amount: number },
    AxiosError<{ message: string }>,
    { addressId: string }
  >({
    mutationFn: ({ addressId }) => createOrder(addressId),

    onError: (error) => {
      toast.error(
        error.response?.data?.message ?? "Failed to create order"
      );
    },
  });

  return {
    createOrder: mutate,
    isLoading: isPending,
  };
};

/* ============================= */
/*        RAZORPAY HOOK          */
/* ============================= */

interface RazorpayInitResponse {
  razorpayOrderId: string;
  key: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

const loadRazorpayScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });

export const useRazorpayPayment = () => {
  const initializePayment = async (
    orderId: string,
    amount: number,
    onSuccess: () => void
  ): Promise<void> => {
    try {
      await loadRazorpayScript();

      const response: RazorpayInitResponse =
        await createRazorpayOrder(orderId);

      const options: RazorpayOptions = {
        key: response.key,
        amount: amount * 100,
        currency: "INR",
        name: "Mealzoid",
        description: "Order Payment",
        order_id: response.razorpayOrderId,

        handler: async (paymentResponse: RazorpayResponse) => {
          try {
            const payload: VerifyPaymentPayload = {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature:
                paymentResponse.razorpay_signature,
              orderId,
            };

            await verifyRazorpayPayment(payload);

            toast.success("Payment successful!");
            onSuccess();
          } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
              toast.error(
                error.response?.data?.message ??
                  "Failed to verify payment"
              );
            } else if (error instanceof Error) {
              toast.error(error.message);
            } else {
              toast.error("Something went wrong");
            }
          }
        },

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        theme: {
          color: "#E23744",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ??
            "Failed to initialize payment"
        );
      } else {
        toast.error("Failed to initialize payment");
      }
    }
  };

  return { initializePayment };
};

export const useMyOrders = () => {
  const { data, isLoading, error } = useQuery<{ orders: Order[] }>({
    queryKey: ["myOrders"],
    queryFn: getMyOrders,
    enabled: !!localStorage.getItem("token"),
  });

  return {
    orders: data?.orders ?? [],
    isLoading,
    error,
  };
};

export const useRestaurantOrders = (restaurantId?: string, limit?: number) => {
  const { data, isLoading, error } = useQuery<{ orders: Order[]; count: number }>({
    queryKey: ["restaurantOrders", restaurantId, limit],
    queryFn: () => getRestaurantOrders(restaurantId!, limit),
    enabled: !!restaurantId,
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });

  return {
    orders: data?.orders ?? [],
    count: data?.count ?? 0,
    isLoading,
    error,
  };
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<
    { order: Order; message: string },
    AxiosError<{ message: string }>,
    { orderId: string; status: string }
  >({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["restaurantOrders"] });
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

export const useSingleOrder = (orderId?: string) => {
  const { data, isLoading, error } = useQuery<{ order: Order }>({
    queryKey: ["order", orderId],
    queryFn: () => getSingleOrder(orderId!),
    enabled: !!orderId,
  });

  return {
    order: data?.order,
    isLoading,
    error,
  };
};