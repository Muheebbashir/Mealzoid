import axios from 'axios'
import type {Role} from '../types/Role.types'

const USER_API_URL= "https://mealzoid-auth.onrender.com/api/auth"


export const loginUser = async (credential: string) => {
  const res = await axios.post(`${USER_API_URL}/login`, {
    code: credential,
  });
  return res.data;
};

// api/userApi.ts
export const addRole = async (role: Role, token: string) => {
  const res = await axios.put(
    `${USER_API_URL}/add/role`,
    { role },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};




