import axios from 'axios';
import type { User } from '../types/user.types';

export const fetchProfile = async (token: string): Promise<User> => {
  const res = await axios.get('https://mealzoid-auth.onrender.com/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.user;
};
