import axios from 'axios';
import type { Address } from '../types/address.types';

const API_URL = 'https://restaurant-service-j5xw.onrender.com/api/address';

export const addAddress = async (
  mobile: number,
  formattedAddress: string,
  latitude: number,
  longitude: number
): Promise<{ message: string; address: Address }> => {
  const res = await axios.post(`${API_URL}/new`, 
    { mobile, formattedAddress, latitude, longitude },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return res.data;
};

export const getMyAddresses = async (): Promise<{ addresses: Address[] }> => {
  const res = await axios.get(`${API_URL}/all`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const deleteAddress = async (id: string): Promise<{ message: string }> => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};