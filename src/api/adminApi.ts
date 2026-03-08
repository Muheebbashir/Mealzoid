import axios from 'axios';

const API_URL = 'https://mealzoid-admin.onrender.com/api/admin';

export const getPendingRestaurants = async () => {
  const res = await axios.get(`${API_URL}/restaurant/pending`, {
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const getPendingRiders = async () => {
  const res = await axios.get(`${API_URL}/rider/pending`, {
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const verifyRestaurant = async (id: string) => {
  const res = await axios.patch(`${API_URL}/verify/restaurant/${id}`, {}, {
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};

export const verifyRider = async (id: string) => {
  const res = await axios.patch(`${API_URL}/verify/rider/${id}`, {}, {
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
};
