import API from "./axiosConfig";

export const registerUserByAdmin = async (userData, token) => {
  const { data } = await API.post("/usuarios/register", userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getAllUsers = async (token) => {
  const { data } = await API.get("/usuarios", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const suspenderUsuario = async (id, token) => {
  const { data } = await API.patch(`/usuarios/${id}/suspender`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const eliminarUsuario = async (id, token) => {
  const { data } = await API.delete(`/usuarios/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
