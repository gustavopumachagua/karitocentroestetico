import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaDownload,
  FaEye,
  FaExclamationTriangle,
  FaSave,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import {
  INITIAL_FORM_DATA,
  STEPS,
  getVisibleSteps,
  normalizeTreatmentRows,
  withLegacyDiagnosisFields,
} from "../../components/FormularioPeptidos/formConfig";
import {
  FormNavigation,
  FormStepProvider,
  StepProgress,
} from "../../components/FormularioPeptidos/FormFields";
import {
  getMissingQuestions,
  STEP_VALIDATORS,
} from "../../components/FormularioPeptidos/formValidations";
import {
  ClinicalHistoryPdfDocument,
  downloadClinicalHistoryPdf,
  getClinicalHistoryPdfErrorMessage,
} from "../../components/FormularioPeptidos/ClinicalHistoryPdf";
import {
  cacheClinicalHistoryRecord,
  loadActiveClinicalHistory,
  loadClinicalHistory,
  saveClinicalHistory,
} from "../../utils/clinicalHistoryStorage";
import {
  applyDoctorProfileToClinicalHistory,
  applyDoctorProfileToFormData,
} from "../../utils/clinicalHistoryDoctorProfile";
import {
  fetchClinicalHistory,
  syncClinicalHistory,
} from "../../utils/clinicalHistoryRemote";
import {
  StepDatosIdentificacion,
  StepMotivoConsulta,
  StepHistoriaPeso,
  StepAntecedentesPersonales,
  StepAntecedentesFamiliares,
  StepGinecoObstetricos,
  StepMedicacionActual,
  StepHabitosEstilo,
  StepSintomasActuales,
  StepEvaluacionSeguridad,
  StepEvaluacionClinica,
  StepExamenesAuxiliares,
  StepEvaluacionMedica,
  StepConductaPlan,
  StepConstanciaMedica,
} from "../../components/FormularioPeptidos/FormSteps";

const STEP_COMPONENTS = [
  StepDatosIdentificacion,
  StepMotivoConsulta,
  StepHistoriaPeso,
  StepAntecedentesPersonales,
  StepAntecedentesFamiliares,
  StepGinecoObstetricos,
  StepMedicacionActual,
  StepHabitosEstilo,
  StepSintomasActuales,
  StepEvaluacionSeguridad,
  StepEvaluacionClinica,
  StepExamenesAuxiliares,
  StepEvaluacionMedica,
  StepConductaPlan,
  StepConstanciaMedica,
];

const getToday = () => new Date().toISOString().split("T")[0];

const getPatientSex = (...values) => {
  const value = values.find((item) => String(item || "").trim());
  const normalized = String(value || "")
    .trim()
    .toLocaleLowerCase("es-PE");

  if (["f", "femenino", "mujer", "female"].includes(normalized)) {
    return "Femenino";
  }
  if (["m", "masculino", "hombre", "male"].includes(normalized)) {
    return "Masculino";
  }

  return String(value || "").trim();
};

const getPatientName = (patient) =>
  String(patient?.nombre || patient?.cliente || "").trim();

const mergePatientSnapshot = (basePatient, incomingPatient) => ({
  ...basePatient,
  ...incomingPatient,
  // The treatment/cita id is the durable identity. A remote history snapshot
  // intentionally contains only patient-facing fields, so never lose it when
  // the name is corrected in the form.
  _id: basePatient?._id || basePatient?.id || incomingPatient?._id || null,
  cita: basePatient?.cita || incomingPatient?.cita || null,
  sexo: basePatient?.sexo || incomingPatient?.sexo || "",
  nombreOriginal:
    basePatient?.nombreOriginal ||
    getPatientName(basePatient) ||
    incomingPatient?.nombre ||
    "",
});

function initialFormData(patient, saved, user, nombre) {
  const appointmentDate = patient?.fecha
    ? new Date(patient.fecha).toISOString().split("T")[0]
    : getToday();
  const lockedSex = getPatientSex(patient?.sexo, saved?.patient?.sexo);
  const defaults = {
    ...INITIAL_FORM_DATA,
    nombreCompleto: getPatientName(patient),
    sexo: lockedSex,
    telefono: patient?.celular || "",
    fechaConsulta: appointmentDate,
    medicoTratante: nombre || "",
    nombreFirmaMedico: nombre || "",
    cmpConstancia: user?.cmp || "",
  };
  const doctorProfile = {
    ...user,
    // Compatibility fallback for a session that only has the legacy `nombre`
    // auth value available.
    nombre: user?.nombre || nombre || "",
  };

  if (!saved?.formData) {
    const profileAwareDefaults = applyDoctorProfileToFormData(
      defaults,
      doctorProfile,
    );
    return {
      ...withLegacyDiagnosisFields(profileAwareDefaults),
      tratamientosPreviosPeso: normalizeTreatmentRows(
        profileAwareDefaults.tratamientosPreviosPeso,
      ),
    };
  }

  const hydratedData = {
    ...defaults,
    ...saved.formData,
    nombreCompleto: saved.formData.nombreCompleto || defaults.nombreCompleto,
    // Sex is an attribute of the selected patient. A stale draft must never
    // overwrite the value shown in the patient history.
    sexo: lockedSex || saved.formData.sexo || defaults.sexo,
    telefono: saved.formData.telefono || defaults.telefono,
    medicoTratante: saved.formData.medicoTratante || defaults.medicoTratante,
    nombreFirmaMedico:
      saved.formData.nombreFirmaMedico || defaults.nombreFirmaMedico,
    cmpConstancia: saved.formData.cmpConstancia || defaults.cmpConstancia,
  };

  const profileAwareData = applyDoctorProfileToFormData(
    hydratedData,
    doctorProfile,
  );

  return {
    ...withLegacyDiagnosisFields(profileAwareData),
    tratamientosPreviosPeso: normalizeTreatmentRows(
      profileAwareData.tratamientosPreviosPeso,
    ),
  };
}

function getIncompleteSteps(visibleSteps, formData) {
  return visibleSteps.reduce((items, step, visibleIndex) => {
    const sourceIndex = STEPS.findIndex((item) => item.id === step.id);
    const validate = STEP_VALIDATORS[sourceIndex];
    if (!validate || validate(formData)) return items;

    const questions = getMissingQuestions(step.id, formData);
    items.push({
      ...step,
      visibleIndex,
      questions: questions.length
        ? questions
        : [
            {
              field: "",
              label: "Revise las respuestas requeridas de esta sección",
            },
          ],
    });
    return items;
  }, []);
}

export default function FormularioPeptidos() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, nombre } = useAuth();
  const pdfRef = useRef(null);
  const [savedRecord] = useState(() => {
    const routePatient = location.state?.paciente;
    // A later peptide appointment can deliberately resolve to the patient's
    // already-finalized history. Carry that read-only record from the
    // selected-patient screen so there is no transient "new form" state
    // while the API confirms the same history again.
    if (location.state?.clinicalHistoryRecord) {
      return location.state.clinicalHistoryRecord;
    }

    return routePatient ? loadClinicalHistory(routePatient) : loadActiveClinicalHistory();
  });
  const syncQueue = useRef(Promise.resolve());
  const activeSyncs = useRef(0);
  const remoteHistoryId = useRef(savedRecord?.remoteId || null);
  // Keep a stable source identity while allowing the clinician to correct the
  // display name. In particular, a treatment/cita id must survive a rename.
  const [sourcePatient] = useState(
    () => location.state?.paciente || savedRecord?.patient || null,
  );
  const [paciente, setPaciente] = useState(() =>
    sourcePatient
      ? {
          ...sourcePatient,
          nombre: getPatientName(sourcePatient),
          nombreOriginal:
            sourcePatient.nombreOriginal || getPatientName(sourcePatient),
        }
      : null,
  );
  const [formData, setFormData] = useState(() =>
    initialFormData(sourcePatient, savedRecord, user, nombre),
  );
  const [currentStep, setCurrentStep] = useState(savedRecord?.currentStep || 0);
  const [savedAt, setSavedAt] = useState(savedRecord?.updatedAt || "");
  const [missingSteps, setMissingSteps] = useState([]);
  // The form is intentionally calm while the clinician advances for the
  // first time. The pending-question guide becomes an explicit review tool
  // only after they choose Guardar.
  const [pendingReviewRequested, setPendingReviewRequested] = useState(
    () => savedRecord?.status === "draft",
  );
  const [showMissing, setShowMissing] = useState(false);
  const [completedRecord, setCompletedRecord] = useState(
    savedRecord?.status === "completed" ? savedRecord : null,
  );
  const [showCompleted, setShowCompleted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const doctorProfile = useMemo(
    () => ({
      nombre: user?.nombre || nombre || "",
      cmp: user?.cmp || "",
      firmaDigital: user?.firmaDigital || "",
    }),
    [nombre, user?.cmp, user?.firmaDigital, user?.nombre],
  );
  // A completed history remains clinically closed. Its patient answers are
  // untouched, while this rendering copy makes the doctor's live profile
  // visible in the form preview and in every new PDF download.
  const completedRecordForPresentation = useMemo(
    () => applyDoctorProfileToClinicalHistory(completedRecord, doctorProfile),
    [completedRecord, doctorProfile],
  );
  const patientSex = useMemo(
    () => getPatientSex(sourcePatient?.sexo, savedRecord?.patient?.sexo, paciente?.sexo),
    [paciente?.sexo, savedRecord?.patient?.sexo, sourcePatient?.sexo],
  );

  const visibleSteps = useMemo(
    () => getVisibleSteps(patientSex || formData.sexo),
    [formData.sexo, patientSex],
  );
  const pendingSteps = useMemo(
    () =>
      pendingReviewRequested || missingSteps.length
        ? getIncompleteSteps(visibleSteps, formData)
        : [],
    [formData, missingSteps.length, pendingReviewRequested, visibleSteps],
  );
  const pendingQuestionCount = useMemo(
    () =>
      pendingSteps.reduce(
        (total, step) => total + step.questions.length,
        0,
      ),
    [pendingSteps],
  );

  useEffect(() => {
    if (!paciente) navigate("/doctor/historial-de-pacientes", { replace: true });
  }, [paciente, navigate]);

  // Local storage recovers instantly; a newer server copy is then hydrated so
  // the draft also survives a different browser or role session.
  useEffect(() => {
    if (!sourcePatient) return undefined;

    let cancelled = false;
    const hydrateFromServer = async () => {
      try {
        const remoteRecord = await fetchClinicalHistory(sourcePatient);
        if (!remoteRecord || cancelled) return;
        remoteHistoryId.current = remoteRecord.remoteId || remoteHistoryId.current;

        const localRecord = loadClinicalHistory(sourcePatient);
        const remoteIsNewer =
          !localRecord ||
          (remoteRecord.status === "completed" &&
            localRecord.status !== "completed") ||
          new Date(remoteRecord.updatedAt).getTime() >
            new Date(localRecord.updatedAt).getTime();

        if (!remoteIsNewer) return;

        const cachedRecord = cacheClinicalHistoryRecord(remoteRecord);
        if (!cachedRecord || cancelled) return;

        const hydratedPatient = mergePatientSnapshot(
          sourcePatient,
          cachedRecord.patient,
        );
        setPaciente(hydratedPatient);
        setFormData(initialFormData(hydratedPatient, cachedRecord, user, nombre));
        setCurrentStep(cachedRecord.currentStep);
        setSavedAt(cachedRecord.updatedAt);
        setCompletedRecord(
          cachedRecord.status === "completed" ? cachedRecord : null,
        );
        // A draft that was saved in another visit/browser should reopen with
        // its review guide available. Completed histories never expose it.
        setPendingReviewRequested(cachedRecord.status === "draft");
      } catch (error) {
        // The local draft remains fully usable offline or while the API is
        // unavailable; synchronization will be retried on Guardar/finalizar.
        console.info("No se pudo recuperar la historia clínica remota.", error);
      }
    };

    hydrateFromServer();
    return () => {
      cancelled = true;
    };
  }, [nombre, sourcePatient, user]);

  useEffect(() => {
    setCurrentStep((step) => Math.max(0, Math.min(step, visibleSteps.length - 1)));
  }, [visibleSteps.length]);

  // `useAuth` reacts to the session write made by Perfil. This keeps the
  // locked doctor fields current when the clinician returns to an unfinished
  // history, without touching answers entered for the patient.
  useEffect(() => {
    setFormData((currentData) =>
      applyDoctorProfileToFormData(currentData, doctorProfile),
    );
  }, [doctorProfile]);

  const persist = useCallback(
    (
      status = completedRecord ? "completed" : "draft",
      stepToPersist = currentStep,
    ) => {
      if (!paciente) return null;
      const patientName = formData.nombreCompleto.trim() || paciente.nombre || "";
      const record = saveClinicalHistory({
        // The editable name updates the patient snapshot, but sourcePatient
        // preserves the immutable cita/tratamiento identity for persistence.
        patient: {
          ...sourcePatient,
          ...paciente,
          nombre: patientName,
          nombreOriginal:
            sourcePatient?.nombreOriginal ||
            getPatientName(sourcePatient) ||
            paciente.nombreOriginal ||
            "",
          sexo: patientSex || paciente.sexo || "",
        },
        formData,
        currentStep: stepToPersist,
        status,
        signatureUrl: user?.firmaDigital || "",
      });
      if (record) setSavedAt(record.updatedAt);
      return record;
    },
    [
      completedRecord,
      currentStep,
      formData,
      paciente,
      patientSex,
      sourcePatient,
      user?.firmaDigital,
    ],
  );

  const syncRecord = useCallback(
    (record, { silent = false } = {}) => {
      if (!record) {
        return Promise.resolve({ record: null, synchronized: false });
      }

      if (!silent) {
        activeSyncs.current += 1;
        setIsSyncing(true);
      }
      // Serialize draft/finalization requests so an earlier save cannot
      // overwrite a later correction to the same patient's name.
      const synchronize = async () => {
        try {
          const remoteRecord = await syncClinicalHistory({
            ...record,
            remoteId: record.remoteId || remoteHistoryId.current,
          });
          if (!remoteRecord) {
            throw new Error("La API no devolvió la historia clínica sincronizada.");
          }
          if (record.status === "completed" && remoteRecord.status !== "completed") {
            throw new Error("La API no confirmó la finalización de la historia clínica.");
          }

          // If localStorage is unavailable, the confirmed server record is
          // still valid and must not be reported as a synchronization failure.
          const synchronizedRecord = cacheClinicalHistoryRecord(remoteRecord) || remoteRecord;
          remoteHistoryId.current = synchronizedRecord.remoteId || remoteHistoryId.current;
          if (synchronizedRecord.patient) {
            setPaciente((currentPatient) => {
              const merged = mergePatientSnapshot(
                currentPatient || sourcePatient,
                synchronizedRecord.patient,
              );
              // Keep a correction typed while the request was in flight;
              // carry the confirmed identity forward into the next save.
              return currentPatient && getPatientName(currentPatient) !== getPatientName(record.patient)
                ? { ...merged, nombre: currentPatient.nombre }
                : merged;
            });
          }
          if (!silent) {
            setSavedAt(synchronizedRecord.updatedAt);
            if (synchronizedRecord.status === "completed") {
              setCompletedRecord(synchronizedRecord);
            }
            const unresolved = remoteRecord.patientUpdate?.citasSinIdentidadVerificada || 0;
            setSyncMessage(unresolved
              ? `Nombre actualizado en los registros vinculados. Hay ${unresolved} citas antiguas sin identidad verificable; no se modificaron para evitar mezclar clientes.`
              : "Cambios guardados y nombre del cliente sincronizado en sus registros.");
          }
          return { record: synchronizedRecord, synchronized: true };
        } catch (error) {
          console.warn("No se pudo sincronizar la historia clínica.", error);
          if (!silent) {
            setSyncMessage(
              `${error.response?.data?.message || "No se pudo sincronizar con el servidor."} El borrador sigue guardado en este equipo.`,
            );
          }
          return { record, synchronized: false, error };
        } finally {
          if (!silent) {
            activeSyncs.current -= 1;
            setIsSyncing(activeSyncs.current > 0);
          }
        }
      };
      const result = syncQueue.current.then(synchronize, synchronize);
      syncQueue.current = result;
      return result;
    },
    [sourcePatient],
  );

  const returnToHistory = useCallback(
    (record = completedRecord) => {
      navigate("/doctor/historial-de-pacientes", {
        replace: true,
        state: {
          // Keep the current appointment/treatment identity. A returning
          // patient can be viewing a finalized document anchored to an older
          // attention, which must not replace the currently selected card.
          paciente: paciente || record?.patient || sourcePatient,
          refreshHistory: Date.now(),
        },
      });
    },
    [completedRecord, navigate, paciente, sourcePatient],
  );

  // Completion is an acknowledgement, not a second screen the doctor must
  // dismiss manually. Give the success message a short visible interval, then
  // close it and return to the refreshed selected-patient history.
  useEffect(() => {
    if (!showCompleted) return undefined;

    const timeout = window.setTimeout(() => {
      setShowCompleted(false);
      returnToHistory();
    }, 2800);

    return () => window.clearTimeout(timeout);
  }, [returnToHistory, showCompleted]);

  useEffect(() => {
    if (!paciente || completedRecord) return undefined;
    const timeout = window.setTimeout(() => persist(), 350);
    return () => window.clearTimeout(timeout);
  }, [completedRecord, currentStep, formData, paciente, persist]);

  const updateField = useCallback((field, value) => {
    // Sex is read from the selected patient and intentionally cannot be
    // altered by a saved draft or a synthetic change event.
    if (field === "sexo") return;

    setFormData((data) =>
      field === "diagnosticos"
        ? withLegacyDiagnosisFields({
            ...data,
            diagnosticos: value,
            // The expandable collection is the source of truth for a live
            // edit. Clear its compatibility mirrors before rebuilding them,
            // otherwise removing the first diagnosis could resurrect a
            // legacy value from diagnostico1.
            diagnostico1: "",
            diagnostico2: "",
            diagnostico3: "",
          })
        : { ...data, [field]: value },
    );
    if (field === "nombreCompleto") {
      setPaciente((currentPatient) =>
        currentPatient ? { ...currentPatient, nombre: value } : currentPatient,
      );
    }
  }, []);

  const goToMissingQuestion = useCallback((visibleIndex, field) => {
    setShowMissing(false);
    setCurrentStep(visibleIndex);

    // The target step mounts after state changes. Two animation frames ensure
    // the specific question exists before we scroll and focus it.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const target = field
          ? document.querySelector(`[data-form-field="${field}"]`) ||
            document.querySelector(`[name="${field}"]`)
          : null;

        if (!target) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        target.scrollIntoView({ behavior: "smooth", block: "center" });
        const control = target.matches("input, textarea, select")
          ? target
          : target.querySelector(
              "input:not([disabled]):not([type='radio']):not([type='checkbox']), textarea:not([disabled]), select:not([disabled])",
            );

        if (control) {
          control.focus({ preventScroll: true });
          return;
        }

        // Choice groups use visually-hidden native controls. Focus their
        // field container instead, so keyboard and screen-reader users are
        // still placed on the exact pending question.
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }, []);

  const handleFinish = async () => {
    if (activeSyncs.current > 0) return;
    const incomplete = getIncompleteSteps(visibleSteps, formData);

    if (incomplete.length) {
      setMissingSteps(incomplete);
      setShowMissing(true);
      return;
    }

    // Keep the resilient local copy as a draft until the server explicitly
    // confirms the finalization. Marking it completed first made a transient
    // network error look like a successful clinical closure and redirected
    // the doctor away from a form that still needed to be retried.
    // The clinician can validate from the pending-question guide without
    // navigating through every screen. A finalized document is nevertheless
    // complete, so persist the final visible step rather than whichever
    // section happened to be open when Finalizar was pressed.
    const completedStep = visibleSteps.length - 1;
    const draftRecord = persist("draft", completedStep);
    if (!draftRecord) {
      setSyncMessage(
        "No se pudo guardar el borrador en este equipo. Revisa el almacenamiento del navegador e inténtalo nuevamente.",
      );
      return;
    }

    const completionCandidate = {
      ...draftRecord,
      status: "completed",
      completedAt: new Date().toISOString(),
    };
    const result = await syncRecord(completionCandidate);

    if (!result.synchronized || result.record?.status !== "completed") {
      setCompletedRecord(null);
      setShowCompleted(false);
      setSyncMessage(
        "No se pudo finalizar en el servidor. El borrador continúa guardado; vuelve a presionar “Finalizar historia” para reintentar.",
      );
      return;
    }

    setCurrentStep(completedStep);
    setCompletedRecord(result.record);
    setShowCompleted(true);
  };

  const handleNext = () => {
    if (currentStep === visibleSteps.length - 1) return handleFinish();
    setCurrentStep((step) => step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (!currentStep) return;
    setCurrentStep((step) => step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // The compact action remains inside the document preview. The completed
  // form header intentionally only exposes "Ver formulario" so it does not
  // present duplicate download actions.
  const downloadPdf = async () => {
    if (!completedRecordForPresentation) return;
    try {
      setPdfError("");
      setDownloading(true);
      await downloadClinicalHistoryPdf(
        pdfRef.current,
        completedRecordForPresentation,
      );
    } catch (error) {
      console.error("No se pudo generar el PDF de la historia clínica.", error);
      setPdfError(getClinicalHistoryPdfErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  };

  const handleSave = async () => {
    if (completedRecord || activeSyncs.current > 0) return;
    // Saving is the clinician's opt-in to the consolidated validation guide.
    // From this point on the counter is derived from live form data, so it
    // continues to change as questions are answered.
    setMissingSteps(getIncompleteSteps(visibleSteps, formData));
    setPendingReviewRequested(true);
    const record = persist();
    await syncRecord(record);
  };

  const goBack = () => {
    let recordToReturn = completedRecord;
    if (!completedRecord) {
      recordToReturn = persist();
      void syncRecord(recordToReturn, { silent: true });
    }

    // Preserve the selected patient when returning to the history. The record
    // snapshot includes an edited patient name while sourcePatient preserves
    // its stable cita/tratamiento identity.
    navigate("/doctor/historial-de-pacientes", {
      state: {
        paciente: paciente || recordToReturn?.patient || sourcePatient,
        refreshHistory: Date.now(),
      },
    });
  };

  if (!paciente || !visibleSteps.length) return null;

  const activeStep = visibleSteps[currentStep];
  const sourceIndex = STEPS.findIndex((item) => item.id === activeStep.id);
  const StepComponent = STEP_COMPONENTS[sourceIndex];

  return (
    <section className="page-section ui-page">
      <div className="page-stack page-stack-narrow">
        <header className="ui-page-header ui-panel flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="ui-eyebrow">Historia clínica</p>
            <h3 className="ui-title mt-1 text-xl sm:text-2xl">{paciente.nombre}</h3>
            <p className="ui-description mt-1 text-xs">
              {syncMessage || (savedAt ? "Borrador guardado" : "Los cambios se guardan automáticamente")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!completedRecord && (
              <button type="button" onClick={handleSave} disabled={isSyncing} className="ui-button ui-button-primary disabled:opacity-60">
                <FaSave /> {isSyncing ? "Guardando…" : "Guardar"}
              </button>
            )}
            {completedRecord && !showCompleted && !completedRecord.remoteId && (
              <button type="button" onClick={() => syncRecord(completedRecord)} disabled={isSyncing} className="ui-button ui-button-secondary inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-60">
                <FaSave /> {isSyncing ? "Sincronizando…" : "Sincronizar"}
              </button>
            )}
            {completedRecord && !showCompleted && (
              <button type="button" onClick={() => setShowPreview(true)} className="ui-button ui-button-secondary">
                <FaEye /> Ver formulario
              </button>
            )}
            {!showCompleted && (
              <button type="button" onClick={goBack} className="ui-button ui-button-ghost">
                <FaArrowLeft /> Volver
              </button>
            )}
          </div>
        </header>

        {completedRecord && !showCompleted && (
          <div className="ui-card flex items-start gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-300" />
            <span>Esta historia clínica ya fue finalizada y está lista para descargar.</span>
          </div>
        )}

        {pdfError && (
          <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
            <span>{pdfError}</span>
            <button type="button" onClick={() => setPdfError("")} className="shrink-0 text-xs font-medium text-rose-200 underline hover:text-white">Cerrar</button>
          </div>
        )}

        {pendingReviewRequested && !completedRecord && (
          <div className="ui-panel flex flex-col gap-4 border-amber-400/25 px-4 py-4 text-sm lg:flex-row lg:items-center lg:justify-between">
            <span>
              <span className="block font-semibold text-amber-50">
                {pendingQuestionCount > 0
                  ? `${pendingQuestionCount} pregunta${
                      pendingQuestionCount === 1 ? "" : "s"
                    } pendiente${pendingQuestionCount === 1 ? "" : "s"}`
                  : "Todas las preguntas pendientes ya fueron respondidas"}
              </span>
              <span className="mt-0.5 block text-xs text-amber-100/80">
                {pendingQuestionCount > 0
                  ? "Abre la guía para saltar directamente a cada campo, sin recorrer las demás secciones."
                  : "Puedes validar y finalizar la historia desde esta sección."}
              </span>
            </span>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {pendingQuestionCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowMissing(true)}
                  className="ui-button rounded-lg border border-amber-300/35 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:border-amber-200/60 hover:bg-amber-400/20"
                >
                  Ver preguntas pendientes
                </button>
              )}
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSyncing}
                className="ui-button ui-button-primary text-xs disabled:opacity-60"
              >
                {isSyncing
                  ? "Finalizando…"
                  : pendingQuestionCount > 0
                    ? "Validar y finalizar"
                    : "Finalizar historia"}
              </button>
            </div>
          </div>
        )}

        <StepProgress
          currentStep={completedRecord ? visibleSteps.length - 1 : currentStep}
          totalSteps={visibleSteps.length}
          steps={visibleSteps}
        />

        {completedRecord ? (
          <div className="ui-panel text-center">
            <p className="text-sm text-slate-300">
              La historia fue cerrada para preservar su integridad clínica. Puedes revisar
              el documento final desde <span className="mx-1 font-semibold text-indigo-200">Ver formulario</span>.
            </p>
          </div>
        ) : (
          <div className="ui-panel ui-clinical-step animate-fade-in" key={activeStep.id}>
            <FormStepProvider section={activeStep.section}>
              <StepComponent formData={formData} updateField={updateField} patientSex={patientSex} firmaDigitalUrl={user?.firmaDigital || ""} />
            </FormStepProvider>
            <FormNavigation
              currentStep={currentStep}
              totalSteps={visibleSteps.length}
              onPrev={handlePrevious}
              onNext={handleNext}
              isFirst={currentStep === 0}
              isLast={currentStep === visibleSteps.length - 1}
            />
          </div>
        )}
      </div>

      {completedRecord && (
        <div aria-hidden="true" style={{ position: "fixed", left: "-30000px", top: 0, width: "210mm" }}>
          <ClinicalHistoryPdfDocument
            ref={pdfRef}
            record={completedRecordForPresentation}
          />
        </div>
      )}

      {showMissing && (
        <div className="ui-modal-backdrop">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="missing-questions-title"
            className="ui-modal max-w-2xl p-4 sm:p-6"
          >
            <div className="flex gap-3">
              <FaExclamationTriangle className="mt-1 shrink-0 text-amber-300" />
              <div>
                <h2 id="missing-questions-title" className="text-lg font-semibold text-white">
                  Faltan preguntas por completar
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Selecciona una pregunta para ir directamente al campo correspondiente.
                  El borrador seguirá guardándose mientras completas la historia.
                </p>
              </div>
            </div>
            <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              {pendingSteps.map((step) => (
                <section
                  key={step.id}
                  className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/35"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 px-3 py-2.5">
                    <h3 className="text-sm font-semibold text-slate-100">
                      {step.section}. {step.title}
                    </h3>
                    <span className="shrink-0 rounded-full bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-200">
                      {step.questions.length} pendiente{step.questions.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-800/80">
                    {step.questions.map((question) => (
                      <button
                        key={`${step.id}-${question.field}-${question.label}`}
                        type="button"
                        onClick={() =>
                          goToMissingQuestion(step.visibleIndex, question.field)
                        }
                        className="flex min-h-11 w-full flex-wrap items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-indigo-400/10 hover:text-white"
                      >
                        <span>{question.label}</span>
                        <span className="shrink-0 text-xs font-medium text-indigo-300">
                          Ir a la pregunta
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMissing(false)}
                className="ui-button ui-button-secondary"
              >
                Continuar editando
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleted && (
        <div className="ui-modal-backdrop">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="completed-history-title"
            className="ui-modal max-w-md p-6 text-center"
          >
            <FaCheckCircle className="mx-auto text-4xl text-emerald-300" />
            <h2 id="completed-history-title" className="mt-3 text-xl font-semibold text-white">
              Historia clínica finalizada
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {`Próximo control: ${new Intl.DateTimeFormat("es-PE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).format(new Date(`${formData.proximoControl}T00:00:00`))}.`}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              La próxima cita se notificará a Gestión de citas al sincronizar la historia.
            </p>
          </div>
        </div>
      )}

      {showPreview && completedRecordForPresentation && (
        <div role="dialog" aria-modal="true" aria-label="Vista previa de historia clínica" className="ui-modal-backdrop p-3 sm:p-6">
          <div className="flex h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-600 bg-[var(--surface-default)] shadow-2xl sm:h-[calc(100dvh-3rem)]">
            <div className="ui-clinical-preview-toolbar flex items-center justify-between gap-3 border-b border-slate-700 px-4 py-3 sm:px-6">
              <div>
                <h2 className="text-base font-semibold text-white">Historia clínica finalizada</h2>
                <p className="text-xs text-slate-400">
                  Vista previa clínica preparada por la aplicación.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadPdf}
                  disabled={downloading}
                  className="ui-button ui-button-primary disabled:opacity-60"
                >
                  <FaDownload /> {downloading ? "Descargando…" : "Descargar"}
                </button>
                <button type="button" onClick={() => setShowPreview(false)} className="ui-button ui-button-secondary">Cerrar</button>
              </div>
            </div>
            <div role="region" aria-label="Documento de historia clínica" tabIndex={0} className="min-h-0 flex-1 overflow-auto bg-slate-950/50 p-3 sm:p-6">
              {pdfError && (
                <div
                  role="alert"
                  className="mx-auto mb-4 flex w-full max-w-[210mm] items-start justify-between gap-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100"
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
              <div className="mx-auto w-fit min-w-full pb-4">
                <ClinicalHistoryPdfDocument
                  record={completedRecordForPresentation}
                  className="mx-auto min-h-0 shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
