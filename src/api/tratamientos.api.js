import API from "./axiosConfig";

export const getTratamientos = async () => {
  const { data } = await API.get("/tratamientos");
  return data;
};

/** Read-only attendance history; includes attended appointments missing a treatment. */
export const getHistorialAtenciones = async () => {
  const { data } = await API.get("/tratamientos/historial-atenciones");
  return data;
};

/** Minimal cross-specialty dataset used only by the daily services report. */
export const getTratamientosParaReporteServicios = async () => {
  const { data } = await API.get("/tratamientos/reporte-servicios");
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
