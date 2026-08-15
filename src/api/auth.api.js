import API from "./axiosConfig";

export const login = async (email, password) => {
  const { data } = await API.post("/auth/login", { email, password });
  return data;
};

export const register = async (userData) => {
  const { data } = await API.post("/auth/register", userData);
  return data;
};

export const changePassword = async (resetToken, password) => {
  const { data } = await API.post("/auth/change-password", {
    resetToken,
    newPassword: password,
  });
  return data;
};

export const resetPassword = async (email) => {
  const { data } = await API.post("/auth/reset-password", { email });
  return data;
};
