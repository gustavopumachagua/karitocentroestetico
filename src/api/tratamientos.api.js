import API from "./axiosConfig";

export const getTratamientos = async () => {
  const { data } = await API.get("/tratamientos");
  return data;
};

export const registrarTratamiento = async (formData) => {
  const { data } = await API.post("/tratamientos", formData);
  return data;
};

export const buscarPaciente = async (nombre) => {
  const { data } = await API.get(
    `/tratamientos/buscar/${encodeURIComponent(nombre)}`
  );
  return data;
};
