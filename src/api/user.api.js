import API from "./axiosConfig";

export const registerUserByAdmin = async (userData) => {
  const { data } = await API.post("/usuarios/register", userData);
  return data;
};

export const getAllUsers = async () => {
  const { data } = await API.get("/usuarios");
  return data;
};

export const suspenderUsuario = async (id) => {
  const { data } = await API.patch(`/usuarios/${id}/suspender`);
  return data;
};

export const eliminarUsuario = async (id) => {
  const { data } = await API.delete(`/usuarios/${id}`);
  return data;
};
