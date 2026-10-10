import { useState } from "react";
import * as XLSX from "xlsx";
import { FiDownload } from "react-icons/fi";
import { useCitas } from "../../hooks/useCitas";
import { getPagos } from "../../api/pagos.api";
import { useProfessionalDirectory } from "../../hooks/useProfessionalDirectory";
import {
  createProfessionalNameIndex,
  getProfessionalDisplayName,
} from "../../utils/professionalDirectory";
import { getPatientKey, getPatientName } from "../../utils/patientIdentity";

const COL_MONTO = "Total de pago";

// Values entered by users must never be interpreted as Excel formulas when a
// staff member opens an exported workbook.
function toSafeSpreadsheetText(value) {
  const text = String(value ?? "");
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

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
  const { obtenerCitas, obtenerTratamientos } = useCitas();
  const { professionalNamesById, refreshProfessionals } = useProfessionalDirectory();
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

      const [citasDesdeBD, pagosDesdeBD, tratamientosDesdeBD, profesionales] =
        await Promise.all([
          obtenerCitas(),
          getPagos(),
          obtenerTratamientos(),
          refreshProfessionals(),
        ]);

      const nombresProfesionales = profesionales.length
        ? createProfessionalNameIndex(profesionales)
        : professionalNamesById;

      const mapaTratamientos = {};
      const tratamientosPorCita = new Map();
      const pacientesPorNombre = new Map();
      if (Array.isArray(tratamientosDesdeBD)) {
        tratamientosDesdeBD.forEach((t) => {
          const patientKey = getPatientKey(t);
          if (!mapaTratamientos[patientKey]) {
            mapaTratamientos[patientKey] = {
              nombre: t.nombre,
              sexo: t.sexo || "No especificado",
              celular: t.celular || "",
            };
          }
          const citaId = String(t.cita?._id || t.cita || "");
          if (citaId) tratamientosPorCita.set(citaId, mapaTratamientos[patientKey]);
          const nameKey = getPatientName(t).toLocaleLowerCase("es-PE");
          if (!pacientesPorNombre.has(nameKey)) pacientesPorNombre.set(nameKey, new Set());
          pacientesPorNombre.get(nameKey).add(patientKey);
        });
      }
      const pagos = Array.isArray(pagosDesdeBD) ? pagosDesdeBD : [];

      const registros = (Array.isArray(citasDesdeBD) ? citasDesdeBD : [])
        .map((cita) => {
          const cliente =
            cita?.cliente && typeof cita.cliente === "object"
              ? cita.cliente
              : { nombre: cita?.cliente };

          const nameCandidates = pacientesPorNombre.get(getPatientName(cita).toLocaleLowerCase("es-PE"));
          // Legacy appointments have no contact information. Fill contact
          // columns only if that display name has a single patient group;
          // an explicit visit/patient ID always takes precedence.
          const legacyKey = nameCandidates?.size === 1 ? [...nameCandidates][0] : null;
          const datosTratamiento = tratamientosPorCita.get(String(cita._id)) ||
            mapaTratamientos[getPatientKey(cita)] || mapaTratamientos[legacyKey] || {};

          const sexoFinal = datosTratamiento.sexo || cita?.sexo || "-";
          const celularFinal = datosTratamiento.celular || cita?.celular || "-";

          const nombreservicios = Array.isArray(cita?.servicio)
            ? cita.servicio.join(", ")
            : cita?.servicio || "";

          const profesionalNombre = getProfessionalDisplayName(
            cita,
            nombresProfesionales,
          );

          const pago = pagoPorCita(cita?._id, pagos);

          if (!pago || pago.estadoPago !== "pagado") return null;

          const totalPago = leerNumeroTotal(pago);
          return {
            "Nombre del cliente": toSafeSpreadsheetText(cliente.nombre || "-"),
            Sexo: toSafeSpreadsheetText(sexoFinal),
            Celular: toSafeSpreadsheetText(celularFinal),
            Servicios: toSafeSpreadsheetText(nombreservicios || "-"),
            Fecha: formatDate(cita?.fecha),
            FechaOriginal: cita?.fecha,
            "Profesional que la atendió": toSafeSpreadsheetText(profesionalNombre || "-"),
            [COL_MONTO]:
              totalPago != null ? `S/ ${totalPago.toFixed(2)}` : "S/ 0.00",
          };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.FechaOriginal) - new Date(a.FechaOriginal));
      const registrosLimpios = registros.map((registro) => {
        const registroLimpio = { ...registro };
        delete registroLimpio.FechaOriginal;
        return registroLimpio;
      });

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
      className="ui-button ui-button-primary w-full sm:w-auto"
      aria-label="Descargar clientes en Excel"
    >
      <FiDownload className="h-4 w-4 sm:h-5 sm:w-5 " />
      {exportando ? "Generando Excel..." : "Descargar Excel"}
    </button>
  );
}
