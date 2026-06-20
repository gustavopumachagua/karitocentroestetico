import API from "./axiosConfig";

export const getInventario = async (rol, token) => {
  const { data } = await API.get(`/inventario/${rol}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const agregarItem = async (item, token) => {
  const { data } = await API.post("/inventario", item, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const eliminarItem = async (id, token) => {
  const { data } = await API.delete(`/inventario/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const descontarInsumos = async (rol, insumos, token) => {
  const { data } = await API.put(
    "/inventario/descontar",
    { rol, insumos },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

export const actualizarItem = async (id, datos, token) => {
  const { data } = await API.put(`/inventario/${id}`, datos, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
