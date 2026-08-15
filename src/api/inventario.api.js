import API from "./axiosConfig";

export const getInventario = async (rol) => {
  const { data } = await API.get(`/inventario/${rol}`);
  return data;
};

export const agregarItem = async (item) => {
  const { data } = await API.post("/inventario", item);
  return data;
};

export const eliminarItem = async (id) => {
  const { data } = await API.delete(`/inventario/${id}`);
  return data;
};

export const descontarInsumos = async (rol, insumos) => {
  const { data } = await API.put("/inventario/descontar", { rol, insumos });
  return data;
};

export const actualizarItem = async (id, datos) => {
  const { data } = await API.put(`/inventario/${id}`, datos);
  return data;
};
