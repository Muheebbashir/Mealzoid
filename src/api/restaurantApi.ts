import axios from 'axios';
import type { Restaurant } from '../types/restaurant.types';

export const createRestaurant = async (formData: FormData): Promise<{ restaurant: Restaurant; token?: string }> => {
  const res = await axios.post('https://restaurant-service-j5xw.onrender.com/api/restaurant/new', formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const fetchMyRestaurant = async (): Promise<{ restaurant: Restaurant; token?: string; message: string }> => {
  const res = await axios.get('https://restaurant-service-j5xw.onrender.com/api/restaurant/my', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const updateRestaurantStatus = async (status: boolean): Promise<{ restaurant: Restaurant; message: string }> => {
  const res = await axios.put('https://restaurant-service-j5xw.onrender.com/api/restaurant/status', 
    { status },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return res.data;
};

export const updateRestaurantDetails = async (data: { name: string; description: string }): Promise<{ restaurant: Restaurant; message: string }> => {
  const res = await axios.put('https://restaurant-service-j5xw.onrender.com/api/restaurant/edit',
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return res.data;
};

export const fetchNearbyRestaurants = async (
  latitude: number, 
  longitude: number, 
  radius?: number,
  search?: string
): Promise<{ restaurants: Restaurant[]; count: number }> => {
  const res = await axios.get('https://restaurant-service-j5xw.onrender.com/api/restaurant/all', {
    params: {
      latitude,
      longitude,
      radius,
      search,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const fetchRestaurantById = async (id: string): Promise<{ restaurant: Restaurant; message: string }> => {
  const res = await axios.get(`https://restaurant-service-j5xw.onrender.com/api/restaurant/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};