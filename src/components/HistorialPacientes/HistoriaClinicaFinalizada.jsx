import { useEffect, useMemo, useRef, useState } from "react";
import { FaCheckCircle, FaDownload } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import {
  ClinicalHistoryPdfDocument,
  downloadClinicalHistoryPdf,
  getClinicalHistoryPdfErrorMessage,
} from "../FormularioPeptidos/ClinicalHistoryPdf";
import {
  CLINICAL_HISTORY_UPDATED_EVENT,
  cacheClinicalHistoryRecord,
  getClinicalHistoryPatientId,
  getCompletedClinicalHistory,
} from "../../utils/clinicalHistoryStorage";
import { fetchClinicalHistory } from "../../utils/clinicalHistoryRemote";
import { applyDoctorProfileToClinicalHistory } from "../../utils/clinicalHistoryDoctorProfile";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/** Shows a finalized clinical history from the same reusable PDF renderer. */
export default function HistoriaClinicaFinalizada({ paciente }) {
  const { user, nombre } = useAuth();
  const [record, setRecord] = useState(() => getCompletedClinicalHistory(paciente));
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const pdfRef = useRef(null);
  const recordForPresentation = useMemo(
    () =>
      applyDoctorProfileToClinicalHistory(record, {
        nombre: user?.nombre || nombre || "",
        cmp: user?.cmp || "",
        firmaDigital: user?.firmaDigital || "",
      }),
    [nombre, record, user?.cmp, user?.firmaDigital, user?.nombre],
  );

  useEffect(() => {
    setRecord(getCompletedClinicalHistory(paciente));
  }, [paciente]);

  // A final record can have been issued from another browser. Hydrate it into
  // the same local adapter used by the downloadable PDF card.
  useEffect(() => {
    if (!paciente) return undefined;

    let cancelled = false;
    const loadRemoteHistory = async () => {
      try {
        const remoteRecord = await fetchClinicalHistory(paciente);
        if (cancelled || remoteRecord?.status !== "completed") return;

        const localRecord = getCompletedClinicalHistory(paciente);
        const remoteIsNewer =
          !localRecord ||
          new Date(remoteRecord.updatedAt).getTime() >
            new Date(localRecord.updatedAt).getTime();

        if (remoteIsNewer) setRecord(cacheClinicalHistoryRecord(remoteRecord));
      } catch (error) {
        // The existing local document remains available if the API is offline.
        console.info("No se pudo cargar la historia clínica remota.", error);
      }
    };

    loadRemoteHistory();
    return () => {
      cancelled = true;
    };
  }, [paciente]);

  useEffect(() => {
    const onHistoryUpdated = (event) => {
      const incoming = event.detail;
      if (
        incoming?.status === "completed" &&
        incoming.patientId === getClinicalHistoryPatientId(paciente)
      ) {
        setRecord(incoming);
      }
    };
    window.addEventListener(CLINICAL_HISTORY_UPDATED_EVENT, onHistoryUpdated);
    return () => window.removeEventListener(CLINICAL_HISTORY_UPDATED_EVENT, onHistoryUpdated);
  }, [paciente]);

  if (!record || !recordForPresentation) return null;

  const handleDownload = async () => {
    try {
      setPdfError("");
      setDownloading(true);
      await downloadClinicalHistoryPdf(pdfRef.current, recordForPresentation);
    } catch (error) {
      console.error("No se pudo descargar la historia clínica.", error);
      setPdfError(getClinicalHistoryPdfErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="ui-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">Historia clínica finalizada</h2>
                <FaCheckCircle className="text-emerald-300" />
              </div>
              <p className="mt-1 text-sm text-slate-400">
                Finalizada el {formatDateTime(record.completedAt)}. Documento listo para descargar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="ui-button ui-button-secondary"
          >
            <FaDownload /> {downloading ? "Generando…" : "Descargar PDF"}
          </button>
        </div>
        {pdfError && (
          <div
            role="alert"
            className="mt-4 flex items-start justify-between gap-3 rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100"
          >
            <span>{pdfError}</span>
            <button
              type="button"
              onClick={() => setPdfError("")}
              className="shrink-0 text-xs font-medium text-rose-200 underline hover:text-white"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
      <div aria-hidden="true" style={{ position: "fixed", left: "-30000px", top: 0, width: "210mm" }}>
        <ClinicalHistoryPdfDocument ref={pdfRef} record={recordForPresentation} />
      </div>
    </>
  );
}
