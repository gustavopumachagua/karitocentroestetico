import { isSamePatient } from "../../utils/patientIdentity";
import { isPendingTreatmentRecord } from "../../utils/attentionHistory";

const normalizarTexto = (valor) =>
  String(valor ?? "")
    .trim()
    .toLowerCase();

const obtenerId = (valor) => {
  if (valor && typeof valor === "object") {
    return String(valor._id || valor.id || "").trim();
  }

  return String(valor || "").trim();
};

const obtenerIdReferencia = (valor) => {
  if (valor && typeof valor === "object") return obtenerId(valor);

  const text = String(valor || "").trim();
  return /^[a-f\d]{24}$/i.test(text) ? text : "";
};

const obtenerIdCitaTratamiento = (tratamiento) =>
  obtenerId(tratamiento?.cita || tratamiento?.citaId);

const obtenerIdCitaPago = (pago) =>
  obtenerId(pago?.cita || pago?.citaId);

const obtenerIdProfesionalTratamiento = (tratamiento) =>
  obtenerIdReferencia(tratamiento?.profesionalId || tratamiento?.profesional);

const obtenerIdProfesionalPago = (pago) =>
  obtenerIdReferencia(pago?.cita?.profesional || pago?.profesionalId);

const obtenerFecha = (valor) => {
  if (!valor) return null;

  const texto = typeof valor === "string" ? valor.replace(" ", "T") : valor;
  const fecha = new Date(texto);

  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const obtenerClaveFecha = (valor, incluirHora = false) => {
  const fecha = obtenerFecha(valor);
  if (!fecha) return "";

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  if (!incluirHora) {
    return `${anio}-${mes}-${dia}`;
  }

  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");

  return `${anio}-${mes}-${dia} ${horas}:${minutos}`;
};

const normalizarServicios = (servicios) => {
  if (Array.isArray(servicios)) {
    return servicios
      .map((servicio) => {
        if (typeof servicio === "string") return normalizarTexto(servicio);
        if (typeof servicio === "object") {
          return normalizarTexto(
            servicio?.nombre || servicio?.servicio || servicio?.descripcion,
          );
        }
        return "";
      })
      .filter(Boolean)
      .sort();
  }

  if (typeof servicios === "string") {
    return servicios
      .split(",")
      .map((servicio) => normalizarTexto(servicio))
      .filter(Boolean)
      .sort();
  }

  return [];
};

const leerMonto = (valor) => {
  if (valor == null) return 0;
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;

  if (typeof valor === "string") {
    const numero = Number(valor.replace(",", "."));
    return Number.isFinite(numero) ? numero : 0;
  }

  if (typeof valor === "object" && typeof valor.$numberDecimal === "string") {
    const numero = Number(valor.$numberDecimal);
    return Number.isFinite(numero) ? numero : 0;
  }

  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
};

const puntuarCoincidenciaPago = (tratamiento, pago) => {
  if (!tratamiento || !pago) return -1;

  const profesionalTratamientoId = obtenerIdProfesionalTratamiento(tratamiento);
  const profesionalPagoId = obtenerIdProfesionalPago(pago);
  if (
    profesionalTratamientoId &&
    profesionalPagoId &&
    profesionalTratamientoId !== profesionalPagoId
  ) {
    return -1;
  }

  const rolTratamiento = normalizarTexto(tratamiento.rol);
  const rolPago = normalizarTexto(
    pago.cita?.profesional?.rol || pago.cita?.rol || pago.rol,
  );
  if (rolTratamiento && rolPago && rolTratamiento !== rolPago) return -1;

  if (!isSamePatient(tratamiento, pago)) {
    return -1;
  }

  const fechaTratamientoMinuto = obtenerClaveFecha(tratamiento.fecha, true);
  const fechaTratamientoDia = obtenerClaveFecha(tratamiento.fecha);
  const fechaPagoReferencia = pago.fecha || pago.cita?.fecha || pago.cita?.fechaCita;
  const fechaPagoMinuto = obtenerClaveFecha(fechaPagoReferencia, true);
  const fechaPagoDia = obtenerClaveFecha(fechaPagoReferencia);

  let puntaje = 0;

  if (
    fechaTratamientoMinuto &&
    fechaPagoMinuto &&
    fechaTratamientoMinuto === fechaPagoMinuto
  ) {
    puntaje += 100;
  } else if (
    fechaTratamientoDia &&
    fechaPagoDia &&
    fechaTratamientoDia === fechaPagoDia
  ) {
    puntaje += 20;
  } else {
    return -1;
  }

  const serviciosTratamiento = normalizarServicios(tratamiento.servicio);
  const serviciosPago = normalizarServicios(
    Array.isArray(pago.servicios) && pago.servicios.length > 0
      ? pago.servicios
      : pago.cita?.servicio,
  );

  if (serviciosTratamiento.length > 0 && serviciosPago.length > 0) {
    const serviciosExactos =
      serviciosTratamiento.length === serviciosPago.length &&
      serviciosTratamiento.every((servicio, idx) => servicio === serviciosPago[idx]);

    if (serviciosExactos) {
      puntaje += 25;
    } else {
      const coincidencias = serviciosTratamiento.filter((servicio) =>
        serviciosPago.includes(servicio),
      ).length;

      puntaje += coincidencias * 8;
    }
  }

  // An immutable account id must win over a display-name snapshot.  This
  // keeps the payment match stable after a doctor or cosmiatra renames their
  // profile, while retaining the name comparison for legacy rows.
  if (
    profesionalTratamientoId &&
    profesionalPagoId &&
    profesionalTratamientoId === profesionalPagoId
  ) {
    puntaje += 10;
  } else if (!profesionalTratamientoId || !profesionalPagoId) {
    const profesionalTratamiento = normalizarTexto(
      tratamiento.profesional?.nombre || tratamiento.profesional,
    );
    const profesionalPago = normalizarTexto(
      pago.cita?.profesional?.nombre || pago.cita?.profesional,
    );

    if (
      profesionalTratamiento &&
      profesionalPago &&
      profesionalTratamiento === profesionalPago
    ) {
      puntaje += 10;
    }
  }

  if (rolTratamiento && rolPago && rolTratamiento === rolPago) {
    puntaje += 5;
  }

  return puntaje;
};

export const obtenerPagoRelacionado = (tratamiento, pagos = []) => {
  if (!tratamiento || !Array.isArray(pagos) || pagos.length === 0) {
    return null;
  }

  // The treatment-to-appointment link is the canonical relation. Resolve it
  // before the compatibility scorer so names, dates or services cannot make
  // a renamed professional lose an otherwise exact payment association.
  const citaId = obtenerIdCitaTratamiento(tratamiento);
  if (isPendingTreatmentRecord(tratamiento)) {
    // Operational rows have no clinical treatment from which to infer a bill.
    // Only an actual paid receipt for this immutable appointment is valid.
    return citaId ? pagos.find((pago) =>
      obtenerIdCitaPago(pago) === citaId && pago.estadoPago === "pagado",
    ) || null : null;
  }
  if (citaId) {
    const pagoPorCita = pagos.find(
      (pago) => obtenerIdCitaPago(pago) === citaId,
    );
    return pagoPorCita || null;
  }

  const candidatos = pagos
    .map((pago) => ({
      pago,
      puntaje: puntuarCoincidenciaPago(tratamiento, pago),
    }))
    .filter(({ puntaje }) => puntaje >= 0)
    .sort((a, b) => b.puntaje - a.puntaje);

  if (candidatos.length === 0) return null;
  if (candidatos.length === 1) return candidatos[0].pago;

  const [mejor, segundo] = candidatos;

  if (mejor.puntaje >= 100 || mejor.puntaje > segundo.puntaje) {
    return mejor.pago;
  }

  return null;
};

export const calcularMonto = (t, pagos = []) => {
  if (isPendingTreatmentRecord(t)) {
    const pago = obtenerPagoRelacionado(t, pagos);
    return pago ? leerMonto(pago.total) : 0;
  }
  const totalTratamiento = leerMonto(t?.total);
  if (totalTratamiento > 0) {
    return totalTratamiento;
  }

  if (Array.isArray(t?.servicio)) {
    if (t.servicio.length > 0 && typeof t.servicio[0] === "object") {
      return t.servicio.reduce((acc, servicio) => {
        return acc + leerMonto(servicio?.precio);
      }, 0);
    }
  }

  const pagoRelacionado = obtenerPagoRelacionado(t, pagos);
  return pagoRelacionado ? leerMonto(pagoRelacionado.total) : 0;
};

/** A legacy ambiguous visit must not count the same receipt twice in totals. */
export const calcularTotalAtenciones = (atenciones = [], pagos = []) => {
  const countedReceipts = new Set();
  return atenciones.reduce((total, record) => {
    const payment = obtenerPagoRelacionado(record, pagos);
    const paymentId = obtenerId(payment);
    if (paymentId) {
      if (countedReceipts.has(paymentId)) return total;
      countedReceipts.add(paymentId);
    }
    return total + calcularMonto(record, pagos);
  }, 0);
};
