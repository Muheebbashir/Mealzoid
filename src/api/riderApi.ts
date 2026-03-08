import axios from 'axios';
import type { Rider } from '../types/rider.types';
import type { Order } from '../types/order.types';

export interface RiderOrderResponse {
  order: Order | null;
  message?: string;
  success?: boolean;
}

const API_URL = 'https://rider-service-iddv.onrender.com/api/rider'; // Update with your rider service port

export const createRiderProfile = async (formData: FormData): Promise<{ message: string; riderProfile: Rider }> => {
  const res = await axios.post(`${API_URL}/new`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const fetchMyRiderProfile = async (): Promise<{ account: Rider }> => {
  const res = await axios.get(`${API_URL}/myprofile`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const toggleRiderAvailability = async (
  isAvailable: boolean,
  latitude: number,
  longitude: number
): Promise<{ message: string; rider: Rider }> => {
  const res = await axios.patch(`${API_URL}/toggle`, 
    { isAvailable, latitude, longitude },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return res.data;
};

export const acceptOrder = async (orderId: string): Promise<{ message: string }> => {
  const res = await axios.post(`${API_URL}/accept/${orderId}`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const fetchMyCurrentOrder = async (): Promise<RiderOrderResponse> => {
  const res = await axios.get(`${API_URL}/order/current`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const updateOrderStatusByRider = async (orderId: string): Promise<{ message: string }> => {
  const res = await axios.put(`${API_URL}/order/update/${orderId}`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export interface AvailableOrder {
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  deliveryAddress: string;
  riderAmount: number;
  distance: number;
  totalAmount: number;
}

export const fetchAvailableOrdersForRider = async (): Promise<{ orders: AvailableOrder[] }> => {
  const res = await axios.get(`${API_URL}/available-orders`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};