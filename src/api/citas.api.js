import API from "./axiosConfig";

export const getCitas = async () => {
  const { data } = await API.get("/citas");
  return data;
};

export const registrarCita = async (citaData) => {
  const { data } = await API.post("/citas", citaData);
  return data;
};

export const actualizarCita = async (id, citaData) => {
  const { data } = await API.put(`/citas/${id}`, citaData);
  return data;
};

export const actualizarEstadoCita = async (id, estado) => {
  const { data } = await API.put(`/citas/${id}/estado`, { estado });
  return data;
};

export const eliminarCita = async (id) => {
  const { data } = await API.delete(`/citas/${id}`);
  return data;
};

export const buscarCitas = async (nombre) => {
  const { data } = await API.get(`/citas/buscar?nombre=${nombre}`);
  return data;
};

export const getProfesionales = async () => {
  const { data } = await API.get("/usuarios/profesionales");
  return data;
};
