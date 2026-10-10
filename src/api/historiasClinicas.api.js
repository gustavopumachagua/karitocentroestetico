import API from "./axiosConfig";

/**
 * API boundary for clinical histories. Components keep their local draft as a
 * resilience layer and use this module for durable, cross-role persistence.
 */
export async function guardarHistoriaClinica(payload) {
  const { data } = await API.put("/historias-clinicas", payload);
  return {
    historia: data?.historia || data,
    pacienteActualizado: data?.pacienteActualizado || null,
  };
}

export async function obtenerHistoriaClinica(params) {
  const { data } = await API.get("/historias-clinicas", { params });
  return data?.historia ?? null;
}

export async function obtenerHistoriasFinalizadas() {
  const { data } = await API.get("/historias-clinicas/finalizadas");
  return data?.historias || data || [];
}

export async function obtenerProximosControles() {
  const { data } = await API.get("/historias-clinicas/proximos-controles");
  return data?.controles || data || [];
}
