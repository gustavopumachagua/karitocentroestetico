import API from "./axiosConfig";

/**
 * Obtiene el inventario de una especialidad.
 *
 * `tipo: "servicio"` se usa al agendar: el backend expone únicamente el
 * catálogo público de servicios de la especialidad elegida, sin revelar sus
 * insumos ni su stock a otro rol profesional.
 */
export const getInventario = async (rol, { tipo } = {}) => {
  const { data } = await API.get(`/inventario/${rol}`, {
    params: tipo ? { tipo } : undefined,
  });
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
