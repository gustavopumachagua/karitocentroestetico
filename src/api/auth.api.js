import API from "./axiosConfig";
import axios from "axios";

export const login = async (email, password) => {
  const { data } = await API.post("/auth/login", { email, password });
  return data;
};

export const register = async (userData) => {
  const { data } = await API.post("/auth/register", userData);
  return data;
};

export const changePassword = async (resetToken, password) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
    {
      resetToken,
      newPassword: password,
    }
  );
  return res.data;
};
