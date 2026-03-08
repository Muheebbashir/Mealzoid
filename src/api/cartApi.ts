import axios from 'axios';
import type { CartResponse, CartItem } from '../types/cart.types';

const API_URL = 'https://restaurant-service-j5xw.onrender.com/api/cart';

export const addToCart = async (
  restaurantId: string, 
  itemId: string
): Promise<{ message: string; cartItem: CartItem }> => {
  const res = await axios.post(`${API_URL}/add`, 
    { restaurantId, itemId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return res.data;
};

export const fetchMyCart = async (): Promise<CartResponse> => {
  const res = await axios.get(`${API_URL}/all`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const incrementCartItem = async (itemId: string): Promise<{ message: string; cartItem: CartItem }> => {
  const res = await axios.put(`${API_URL}/inc`, 
    { itemId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return res.data;
};

export const decrementCartItem = async (itemId: string): Promise<{ message: string; cartItem?: CartItem }> => {
  const res = await axios.put(`${API_URL}/dec`, 
    { itemId },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return res.data;
};

export const clearCart = async (): Promise<{ message: string }> => {
  const res = await axios.delete(`${API_URL}/clear`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};