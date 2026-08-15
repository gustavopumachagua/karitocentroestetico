import { useState, useCallback } from "react";

export const useModal = (initialState = { show: false, message: "", type: "info" }) => {
  const [modal, setModal] = useState(initialState);

  const mostrarModal = useCallback((message, type = "success") => {
    setModal({ show: true, message, type });
  }, []);

  const cerrarModal = useCallback(() => {
    setModal((prev) => ({ ...prev, show: false }));
  }, []);

  return { modal, setModal, mostrarModal, cerrarModal };
};
