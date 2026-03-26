import { useState } from "react";
import * as XLSX from "xlsx";
import { FiDownload } from "react-icons/fi";
import axios from "axios";
import { useCitas } from "../../context/CitasContext";

const COL_MONTO = "Total de pago";

function pagoPorCita(citaId, pagos) {
  if (!Array.isArray(pagos)) return null;

  return (
    pagos.find((p) => {
      if (p.cita && typeof p.cita === "object") {
        return String(p.cita._id) === String(citaId);
      }

      if (typeof p.cita === "string") {
        return String(p.cita) === String(citaId);
      }

      if (p.citaId) {
        return String(p.citaId) === String(citaId);
      }

      return false;
    }) || null
  );
}

function leerNumeroTotal(pago) {
  if (!pago || pago.total == null) return null;
  const t = pago.total;
  if (typeof t === "number" && Number.isFinite(t)) return t;
  if (typeof t === "string") {
    const n = Number(t.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  if (typeof t === "object" && typeof t.$numberDecimal === "string") {
    const n = Number(t.$numberDecimal);
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function forzarColumnaTexto(ws, nombreColumna, filasDatosOrdenadas) {
  if (!ws["!ref"] || !filasDatosOrdenadas.length) return;
  const keys = Object.keys(filasDatosOrdenadas[0] || {});
  const c = keys.indexOf(nombreColumna);
  if (c < 0) return;
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let r = 1; r <= range.e.r; r++) {
    const addr = XLSX.utils.encode_cell({ r, c });
    const cell = ws[addr];
    if (!cell) continue;
    const valor = filasDatosOrdenadas[r - 1]?.[nombreColumna];
    cell.t = "s";
    cell.v = valor === undefined || valor === null ? "S/ 0.00" : String(valor);
    if (cell.w != null) delete cell.w;
  }
}

export default function ExportarExcelButton() {
  const { citas, obtenerCitas, obtenerTratamientos, pagos } = useCitas();
  const [exportando, setExportando] = useState(false);

  const formatDate = (value) => {
    if (!value) return "";
    const fecha = new Date(value);
    if (Number.isNaN(fecha.getTime())) return value;
    return fecha.toLocaleString("es-PE", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const exportarExcel = async () => {
    try {
      setExportando(true);

      const token = localStorage.getItem("token");
      const API_PAGOS = `${import.meta.env.VITE_API_URL}/api/pagos`;

      const [citasDesdeBD, pagosDesdeBD, tratamientosDesdeBD] =
        await Promise.all([
          Array.isArray(citas) && citas.length
            ? Promise.resolve(citas)
            : obtenerCitas(),
          axios.get(API_PAGOS, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          obtenerTratamientos(),
        ]);

      const mapaTratamientos = {};
      if (Array.isArray(tratamientosDesdeBD)) {
        tratamientosDesdeBD.forEach((t) => {
          const nombreNormalizado = t.nombre?.trim().toLowerCase();
          if (nombreNormalizado && !mapaTratamientos[nombreNormalizado]) {
            mapaTratamientos[nombreNormalizado] = {
              nombre: t.nombre,
              edad: t.edad,
              sexo: t.sexo || "No especificado",
              celular: t.celular || "",
            };
          }
        });
      }
      const pagos = Array.isArray(pagosDesdeBD?.data) ? pagosDesdeBD.data : [];

      const registros = (Array.isArray(citasDesdeBD) ? citasDesdeBD : [])
        .map((cita) => {
          const cliente =
            cita?.cliente && typeof cita.cliente === "object"
              ? cita.cliente
              : { nombre: cita?.cliente };

          const nombreClienteNormalizado = cliente.nombre?.trim().toLowerCase();

          const datosTratamiento =
            mapaTratamientos[nombreClienteNormalizado] || {};

          const edadFinal = datosTratamiento.edad || cita?.edad || "-";
          const sexoFinal = datosTratamiento.sexo || cita?.sexo || "-";
          const celularFinal = datosTratamiento.celular || cita?.celular || "-";

          const nombreservicios = Array.isArray(cita?.servicio)
            ? cita.servicio.join(", ")
            : cita?.servicio || "";

          const profesionalNombre =
            cita?.profesional && typeof cita.profesional === "object"
              ? cita.profesional.nombre || cita.profesional
              : cita?.profesional || "";

          const pago = pagoPorCita(cita?._id, pagos);

          if (!pago || pago.estadoPago !== "pagado") return null;

          const totalPago = leerNumeroTotal(pago);
          return {
            "Nombre del cliente": cliente.nombre || "-",
            Edad: edadFinal,
            Sexo: sexoFinal,
            Celular: celularFinal,
            Servicios: nombreservicios || "-",
            Fecha: formatDate(cita?.fecha),
            FechaOriginal: cita?.fecha,
            "Profesional que la atendió": profesionalNombre || "-",
            [COL_MONTO]:
              totalPago != null ? `S/ ${totalPago.toFixed(2)}` : "S/ 0.00",
          };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.FechaOriginal) - new Date(a.FechaOriginal));
      const registrosLimpios = registros.map(
        ({ FechaOriginal, ...rest }) => rest,
      );

      const ws = XLSX.utils.json_to_sheet(registrosLimpios);
      forzarColumnaTexto(ws, COL_MONTO, registrosLimpios);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Clientes");

      const ahora = new Date();
      const nombreArchivo = `clientes_registrados_${ahora
        .toISOString()
        .slice(0, 10)}.xlsx`;

      XLSX.writeFile(wb, nombreArchivo);
    } catch (error) {
      console.error("Error al exportar excel:", error);
      alert(
        "Ocurrió un error al generar el archivo Excel. Intenta nuevamente.",
      );
    } finally {
      setExportando(false);
    }
  };

  return (
    <button
      onClick={exportarExcel}
      disabled={exportando}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 transition-all duration-300 shadow-lg disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      aria-label="Descargar clientes en Excel"
    >
      <FiDownload className="h-4 w-4 sm:h-5 sm:w-5 " />
      {exportando ? "Generando Excel..." : "Descargar Excel"}
    </button>
  );
}
