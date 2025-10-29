export const calcularMonto = (t, pagos = []) => {
  if (typeof t.total === "number" && t.total > 0) {
    return t.total;
  }

  if (Array.isArray(t.servicio)) {
    if (t.servicio.length > 0 && typeof t.servicio[0] === "object") {
      return t.servicio.reduce((acc, s) => acc + (Number(s.precio) || 0), 0);
    }

    const pagoRelacionado = pagos.find(
      (p) =>
        p.cliente?.toLowerCase() === t.nombre?.toLowerCase() &&
        new Date(p.fecha).toDateString() === new Date(t.fecha).toDateString()
    );

    if (pagoRelacionado) {
      return Number(pagoRelacionado.total) || 0;
    }
  }

  const pago = pagos.find(
    (p) =>
      p.cliente?.toLowerCase() === t.nombre?.toLowerCase() &&
      new Date(p.fecha).toDateString() === new Date(t.fecha).toDateString()
  );

  if (pago) {
    return Number(pago.total) || 0;
  }

  return 0;
};
