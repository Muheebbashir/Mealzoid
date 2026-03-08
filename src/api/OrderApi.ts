import axios from "axios";
import type { Order } from "../types/order.types";

const RESTAURANT_API = "https://restaurant-service-j5xw.onrender.com/api/order";
const PAYMENT_API = "https://mealzoid-utils.onrender.com/api/payment";

export const createOrder = async (
  addressId: string
): Promise<{ message: string; orderId: string; amount: number }> => {
  const res = await axios.post(
    `${RESTAURANT_API}/new`,
    {
      addressId,
      paymentMethod: "razorpay",
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return res.data;
};

export const createRazorpayOrder = async (
  orderId: string
): Promise<{ razorpayOrderId: string; key: string }> => {
  const res = await axios.post(
    `${PAYMENT_API}/create`,
    { orderId }
  );

  return res.data;
};

export const verifyRazorpayPayment = async (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}): Promise<{ message: string }> => {
  const res = await axios.post(
    `${PAYMENT_API}/verify`,
    data
  );

  return res.data;
};

export const getMyOrders = async (): Promise<{ orders: Order[] }> => {
  const res = await axios.get(`${RESTAURANT_API}/my`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const getRestaurantOrders = async (restaurantId: string, limit?: number): Promise<{ orders: Order[]; count: number }> => {
  const res = await axios.get(`https://restaurant-service-j5xw.onrender.com/api/order/restaurant/${restaurantId}`, {
    params: { limit },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<{ order: Order; message: string }> => {
  const res = await axios.put(`https://restaurant-service-j5xw.onrender.com/api/order/${orderId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return res.data;
};

export const getSingleOrder = async (orderId: string): Promise<{ order: Order }> => {
  const res = await axios.get(`${RESTAURANT_API}/${orderId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};