import API from "./axiosConfig";

export const getPagos = async () => {
  const { data } = await API.get("/pagos");
  return data;
};

export const registrarPago = async (pagoData) => {
  const { data } = await API.post("/pagos", pagoData);
  return data;
};
