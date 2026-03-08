import axios from 'axios';
import type { MenuItem } from '../types/menuItem.types';

const API_URL = 'https://restaurant-service-j5xw.onrender.com/api/item';

export const addMenuItem = async (formData: FormData): Promise<{ item: MenuItem; message: string }> => {
  const res = await axios.post(`${API_URL}/new`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getAllMenuItems = async (restaurantId: string): Promise<{ items: MenuItem[] }> => {
  const res = await axios.get(`${API_URL}/all/${restaurantId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const deleteMenuItem = async (itemId: string): Promise<{ message: string }> => {
  const res = await axios.delete(`${API_URL}/${itemId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const toggleMenuItemAvailability = async (itemId: string): Promise<{ item: MenuItem; message: string }> => {
  const res = await axios.patch(`${API_URL}/status/${itemId}`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};