import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InfoPaciente from "./InfoPaciente";
import ObservacionesImagenes from "./ObservacionesImagenes";
import ListaTratamientosAnteriores from "./ListaTratamientosAnteriores";
import { FaArrowLeft, FaFileAlt } from "react-icons/fa";
import {
  CLINICAL_HISTORY_UPDATED_EVENT,
  cacheClinicalHistoryRecord,
  getClinicalHistoryPatientId,
  loadClinicalHistory,
} from "../../utils/clinicalHistoryStorage";
import { fetchClinicalHistory } from "../../utils/clinicalHistoryRemote";
import { useAuth } from "../../hooks/useAuth";
import { getOtherPatientAttentions, isPendingTreatmentRecord } from "../../utils/attentionHistory";
import AtencionPendienteBadge from "./AtencionPendienteBadge";

const getHistoryStatus = (record) => {
  if (!record?.formData) return "none";

  const status = String(record.status || "").trim().toLowerCase();
  return ["completed", "finalized", "finalizada"].includes(status)
    ? "completed"
    : "draft";
};

const getRecordUpdatedAt = (record) => {
  const timestamp = Date.parse(record?.updatedAt || record?.completedAt || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
};

// A completed local document must never be visually downgraded by a stale
// server draft while the final synchronization is still in flight.
const getPreferredHistory = (localRecord, remoteRecord) => {
  const localStatus = getHistoryStatus(localRecord);
  const remoteStatus = getHistoryStatus(remoteRecord);

  if (localStatus === "completed" && remoteStatus !== "completed") {
    return localRecord;
  }
  if (remoteStatus === "completed" && localStatus !== "completed") {
    return remoteRecord;
  }
  if (!localRecord) return remoteRecord || null;
  if (!remoteRecord) return localRecord;

  return getRecordUpdatedAt(remoteRecord) >= getRecordUpdatedAt(localRecord)
    ? remoteRecord
    : localRecord;
};

const FORM_BUTTON_LABELS = {
  none: "Empezar formulario",
  draft: "Continuar formulario",
  completed: "Formulario completada",
};

export default function DetallePaciente({
  paciente,
  tratamientos,
  onSeleccionar,
  onVolver,
  mostrarAtenciones = false,
}) {
  const navigate = useNavigate();
  const { rol } = useAuth();
  const esAtencionPendiente = isPendingTreatmentRecord(paciente);
  const puedeVerHistoriaClinica = rol === "doctor" && !esAtencionPendiente;
  const patientId = puedeVerHistoriaClinica ? getClinicalHistoryPatientId(paciente) : "";
  const [historyRecord, setHistoryRecord] = useState(() =>
    puedeVerHistoriaClinica ? loadClinicalHistory(paciente) : null,
  );
  // The resolved history may be anchored to a previous appointment when a
  // patient returns for peptide care. Keep the selected source id separately
  // from the history's own immutable appointment/treatment id.
  const [historyRecordPatientId, setHistoryRecordPatientId] = useState(
    () => patientId,
  );

  const tratamientosAnteriores = getOtherPatientAttentions(tratamientos, paciente);

  const servicios = useMemo(
    () =>
      Array.isArray(paciente?.servicio)
        ? paciente.servicio.map((s) => s.toLowerCase())
        : String(paciente?.servicio || "")
            .split(",")
            .map((s) => s.trim().toLowerCase()),
    [paciente?.servicio],
  );

  const esPeptidos = servicios.some(
    (s) =>
      s.includes("péptido") ||
      s.includes("peptido") ||
      s.includes("tirzepatida"),
  );
  // DetailPaciente stays mounted when the doctor selects another patient.
  // Do not briefly show the prior patient's status during that transition.
  const currentHistoryRecord =
    !puedeVerHistoriaClinica ? null : historyRecordPatientId === patientId
      ? historyRecord
      : loadClinicalHistory(paciente);
  const historyStatus = getHistoryStatus(currentHistoryRecord);

  useEffect(() => {
    const localRecord = puedeVerHistoriaClinica ? loadClinicalHistory(paciente) : null;
    setHistoryRecordPatientId(patientId);
    setHistoryRecord(localRecord);

    if (!puedeVerHistoriaClinica || !paciente || !patientId) return undefined;

    let cancelled = false;
    const hydrateRemoteHistory = async () => {
      try {
        const remoteRecord = await fetchClinicalHistory(paciente);
        if (cancelled || !remoteRecord) return;

        // Re-read immediately before caching: the clinician may have saved a
        // newer local draft while the request was in flight. Never let an
        // older server copy overwrite that local work.
        const latestLocalRecord = loadClinicalHistory(paciente);
        const preferredRecord = getPreferredHistory(
          getPreferredHistory(localRecord, latestLocalRecord),
          remoteRecord,
        );
        const cachedRecord =
          preferredRecord === remoteRecord
            ? cacheClinicalHistoryRecord(remoteRecord) || remoteRecord
            : preferredRecord;
        if (cancelled) return;

        setHistoryRecordPatientId(patientId);
        setHistoryRecord((currentRecord) =>
          getPreferredHistory(
            getPreferredHistory(preferredRecord, currentRecord),
            cachedRecord,
          ),
        );
      } catch {
        // A local draft/finalized record remains the source of truth while
        // the history API is unavailable or has no record for this patient.
      }
    };

    hydrateRemoteHistory();
    return () => {
      cancelled = true;
    };
  }, [paciente, patientId, puedeVerHistoriaClinica]);

  useEffect(() => {
    if (!puedeVerHistoriaClinica) return undefined;
    const handleHistoryUpdated = (event) => {
      const incomingRecord = event.detail;
      if (incomingRecord?.patientId !== patientId) return;

      setHistoryRecordPatientId(patientId);
      setHistoryRecord((currentRecord) =>
        getPreferredHistory(currentRecord, incomingRecord),
      );
    };

    window.addEventListener(CLINICAL_HISTORY_UPDATED_EVENT, handleHistoryUpdated);
    return () =>
      window.removeEventListener(
        CLINICAL_HISTORY_UPDATED_EVENT,
        handleHistoryUpdated,
      );
  }, [patientId, puedeVerHistoriaClinica]);

  const handleFormulario = () => {
    if (!puedeVerHistoriaClinica) return;
    navigate("/doctor/historial-de-pacientes/formulario", {
      state: {
        paciente,
        // Preserve the result of the validated fallback lookup (a completed
        // history from an earlier peptide appointment) while the form page
        // hydrates from the API.
        clinicalHistoryRecord: currentHistoryRecord || undefined,
      },
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="ui-page-header flex flex-col gap-4 rounded-2xl px-1 py-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-300/80">
            Paciente seleccionado
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-white">
            {paciente.nombre}
          </h3>
          <AtencionPendienteBadge record={paciente} className="mt-3" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {puedeVerHistoriaClinica && esPeptidos && (
            <button
              onClick={handleFormulario}
              className="ui-button ui-button-secondary inline-flex items-center justify-center gap-2 rounded-lg border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-100 transition hover:border-violet-300/40 hover:bg-violet-400/15"
            >
              <FaFileAlt />
              {FORM_BUTTON_LABELS[historyStatus]}
            </button>
          )}
          <button
            onClick={onVolver}
            className="ui-button ui-button-ghost inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/15"
          >
            <FaArrowLeft /> Volver al listado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InfoPaciente paciente={paciente} />
        {esAtencionPendiente ? (
          <div className="ui-card p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-slate-300">
              Esta atención está registrada en la agenda. El profesional aún no ha registrado un tratamiento.
            </p>
          </div>
        ) : (
          <ObservacionesImagenes paciente={paciente} />
        )}
      </div>

      <ListaTratamientosAnteriores
        tratamientos={tratamientosAnteriores}
        onSeleccionar={onSeleccionar}
        mostrarAtenciones={mostrarAtenciones}
      />
    </div>
  );
}
