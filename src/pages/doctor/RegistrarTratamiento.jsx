import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCitas } from "../../hooks/useCitas";
import { useAuth } from "../../hooks/useAuth";
import { useTreatmentPatient } from "../../hooks/useTreatmentPatient";
import { getAuthSession } from "../../services/authStorage";
import { belongsToProfessionalRole } from "../../utils/professionalOwnership";
import {
  fillTreatmentPatient,
  getTreatmentAppointmentId,
  normalizeTreatmentSex,
  selectTreatmentAppointment,
} from "../../utils/treatmentAppointment";
import { useModal } from "../../hooks/useModal";
import InputField from "../../components/RegistaTratamiento/InputField";
import TextAreaField from "../../components/RegistaTratamiento/TextAreaField";
import RadioGroup from "../../components/RegistaTratamiento/RadioGroup";
import ImageUploader from "../../components/RegistaTratamiento/ImageUploader";
import FechaField from "../../components/RegistaTratamiento/FechaField";
import ActionButtons from "../../components/RegistaTratamiento/ActionButtons";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import { getInventario, descontarInsumos } from "../../api/inventario.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import CustomChoice from "../../components/common/CustomChoice";

import { FaSearch } from "react-icons/fa";

const INITIAL_FORM = {
  nombre: "",
  sexo: "",
  celular: "",
  servicio: "",
  fecha: "",
  observacion: "",
  insumos: [],
};

function createInitialForm(cita) {
  return {
    ...INITIAL_FORM,
    nombre: typeof cita?.cliente === "object" ? cita?.cliente?.nombre || "" : cita?.cliente || "",
    servicio: cita?.servicio || "",
    fecha: cita?.fecha || "",
    insumos: [],
  };
}

export default function RegistrarTratamiento() {
  const { citas, citaSeleccionada, setCitaSeleccionada } = useCitas();
  const { nombre, rol, user, token } = useAuth();
  const sessionKey = `${token}:${user?.id || user?._id || ""}`;
  const [submission, setSubmission] = useState(null);
  const citasFiltradas = useMemo(
    () => citas.filter((cita) => {
      if (cita.estado?.toLowerCase() !== "pendiente") return false;
      switch (rol) {
        case "doctor":
        case "cosmiatra":
          return belongsToProfessionalRole(cita, user);
        case "asistente":
          return typeof cita.asistente === "string" &&
            cita.asistente.toLowerCase() === nombre.toLowerCase();
        case "recepcionista":
          return true;
        default:
          return false;
      }
    }),
    [citas, nombre, rol, user],
  );
  const suggestedAppointment = useMemo(
    () => selectTreatmentAppointment(citasFiltradas, citaSeleccionada),
    [citasFiltradas, citaSeleccionada],
  );
  // The server can publish "attended" before POST resolves. Keep that editor
  // mounted until its own save/stock update/confirmation finishes; otherwise a
  // realtime refresh could discard a successful registration's final steps.
  const cita = submission?.sessionKey === sessionKey
    ? submission.cita : suggestedAppointment;
  const citaId = getTreatmentAppointmentId(cita);
  const seleccionadaId = getTreatmentAppointmentId(citaSeleccionada);

  const handleSubmissionChange = useCallback((appointment, inProgress) => {
    setSubmission((previous) => {
      if (inProgress) return { sessionKey, cita: appointment };
      return previous?.sessionKey === sessionKey &&
        getTreatmentAppointmentId(previous.cita) === getTreatmentAppointmentId(appointment)
        ? null : previous;
    });
  }, [sessionKey]);

  useEffect(() => {
    if (citaId !== seleccionadaId) setCitaSeleccionada(cita);
  }, [cita, citaId, seleccionadaId, setCitaSeleccionada]);

  // A different appointment/account gets a fresh editor, including image URLs,
  // observations and pending requests. No demographics survive across patients.
  return (
    <TreatmentEditor
      key={`${sessionKey}:${citaId}`}
      cita={cita}
      onSubmissionChange={handleSubmissionChange}
    />
  );
}

function TreatmentEditor({ cita, onSubmissionChange }) {
  const {
    setCitaSeleccionada,
    socket,
    obtenerTratamientos,
  } = useCitas();
  const { nombre: nombreDoctor, rol, token: sessionToken, user } = useAuth();
  const { modal, setModal, cerrarModal } = useModal();
  const citaId = getTreatmentAppointmentId(cita);
  const hasAppointment = Boolean(citaId);
  const { status: patientStatus, patient, error: patientError, retry: retryPatient } =
    useTreatmentPatient(citaId);

  const formBloqueado = !hasAppointment || cita?.estado?.toLowerCase() === "atendido";
  const [loading, setLoading] = useState(false);
  const [insumosDisponibles, setInsumosDisponibles] = useState([]);
  const [busquedaInsumo, setBusquedaInsumo] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [formData, setFormData] = useState(() => createInitialForm(cita));
  const [enviando, setEnviando] = useState(false);
  const envioEnCursoRef = useRef(false);
  const obtenerTratamientosRef = useRef(obtenerTratamientos);
  const imagePreviewUrls = useRef(new Set());
  const mountedRef = useRef(true);
  const reloadTimersRef = useRef([]);
  const actorId = String(user?.id || user?._id || "");

  const isCurrentSession = useCallback(() => {
    const session = getAuthSession();
    return mountedRef.current && Boolean(sessionToken) &&
      session.token === sessionToken &&
      String(session.user?.id || session.user?._id || "") === actorId;
  }, [actorId, sessionToken]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      reloadTimersRef.current.forEach(clearTimeout);
      reloadTimersRef.current = [];
    };
  }, []);

  useEffect(() => () => {
    imagePreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    imagePreviewUrls.current.clear();
  }, []);

  useEffect(() => {
    obtenerTratamientosRef.current = obtenerTratamientos;
  }, [obtenerTratamientos]);

  const recargarTratamientos = useCallback(
    () => obtenerTratamientosRef.current(),
    [],
  );

  const rolProfesional = useMemo(
    () => (rol === "doctor" || rol === "cosmiatra" ? rol : ""),
    [rol],
  );

  const insumosFiltrados = useMemo(() => {
    const termino = busquedaInsumo.trim().toLocaleLowerCase();

    return insumosDisponibles.filter((insumo) =>
      String(insumo.nombre || "").toLocaleLowerCase().includes(termino),
    );
  }, [busquedaInsumo, insumosDisponibles]);

  useEffect(() => {
    if (hasAppointment && patientStatus === "ready" && patient) {
      setFormData((previous) => fillTreatmentPatient(previous, patient));
    }
  }, [hasAppointment, patient, patientStatus]);

  const patientReady = hasAppointment && patientStatus === "ready";
  const sexoRegistrado = normalizeTreatmentSex(patient?.sexo);
  const datosBloqueados = formBloqueado || !patientReady || enviando;

  useEffect(() => {
    let activo = true;

    const obtenerInsumos = async () => {
      if (!rolProfesional) {
        setInsumosDisponibles([]);
        return;
      }

      try {
        const data = await getInventario(rolProfesional);

        if (!activo) return;

        // La API ya consulta por rol. El filtro local es una segunda barrera de
        // presentación para que nunca se muestren servicios ni ítems de otra
        // especialidad si la respuesta cambia o se actualiza en tiempo real.
        const insumosDelRol = Array.isArray(data)
          ? data.filter(
              (item) =>
                item?.rol?.toLowerCase() === rolProfesional &&
                item?.tipo?.toLowerCase() === "insumo",
            )
          : [];

        setInsumosDisponibles(insumosDelRol);
      } catch (error) {
        if (activo) {
          setInsumosDisponibles([]);
          console.error("Error al obtener insumos:", error);
        }
      }
    };

    obtenerInsumos();

    return () => {
      activo = false;
    };
  }, [rolProfesional]);

  useEffect(() => {
    setFormData((previous) => ({
      ...previous,
      nombre: (hasAppointment && patient?.nombre) || (typeof cita?.cliente === "object"
        ? cita?.cliente?.nombre || "" : cita?.cliente || ""),
      servicio: cita?.servicio || "",
      fecha: cita?.fecha || "",
    }));
  }, [cita?.cliente, cita?.fecha, cita?.servicio, hasAppointment, patient?.nombre]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const nuevasImagenes = files.map((file) => {
      const url = URL.createObjectURL(file);
      imagePreviewUrls.current.add(url);
      return { id: Date.now() + Math.random(), url, file };
    });
    setImagenes((current) => [...current, ...nuevasImagenes]);
  };

  const handleRemoveImage = (id) => {
    const removed = imagenes.find((image) => image.id === id);
    if (removed) {
      URL.revokeObjectURL(removed.url);
      imagePreviewUrls.current.delete(removed.url);
    }
    setImagenes((current) => current.filter((img) => img.id !== id));
  };

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      void recargarTratamientos();
      if (envioEnCursoRef.current) return;
      setModal({
        show: true,
        message: "🔄 Nuevo tratamiento registrado por otro usuario.",
        type: "info",
      });
    };

    socket.on("tratamientoActualizado", handleUpdate);

    return () => {
      socket.off("tratamientoActualizado", handleUpdate);
    };
  }, [socket, recargarTratamientos, setModal]);

  const handleGuardar = async (e) => {
    e.preventDefault();

    // El ref se actualiza de forma síncrona para bloquear clics/Enter repetidos
    // antes de que React alcance a renderizar el botón deshabilitado.
    if (!hasAppointment || envioEnCursoRef.current || formBloqueado || !patientReady || !isCurrentSession()) return;

    if (!formData.insumos || formData.insumos.length === 0) {
      setModal({
        show: true,
        message:
          "⚠️ Debes seleccionar al menos un insumo utilizado antes de guardar.",
        type: "error",
      });
      return;
    }

    if (!normalizeTreatmentSex(formData.sexo) || !/^\d{9}$/.test(formData.celular)) {
      setModal({
        show: true,
        message: "⚠️ Completa el sexo y un celular válido de 9 dígitos antes de guardar.",
        type: "error",
      });
      return;
    }

    envioEnCursoRef.current = true;
    setEnviando(true);
    onSubmissionChange(cita, true);
    let tratamientoRegistrado = false;

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => formDataToSend.append(key, v));
        } else {
          formDataToSend.append(key, value);
        }
      });

      formDataToSend.append("profesional", nombreDoctor);
      formDataToSend.append("rol", rol);

      if (citaId) {
        formDataToSend.append("citaId", citaId);
      }

      imagenes.forEach((img) => {
        formDataToSend.append("imagenes", img.file);
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tratamientos`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${sessionToken}` },
          body: formDataToSend,
        },
      );

      // Do not let a request started by one account trigger refreshes or stock
      // writes using a different account that signed in while it was pending.
      if (!isCurrentSession()) return;

      if (res.ok) {
        // Una vez aceptado por el servidor el formulario permanece bloqueado.
        // Así no se puede reenviar mientras se muestra la confirmación.
        tratamientoRegistrado = true;

        setFormData({
          nombre: "",
          sexo: "",
          celular: "",
          servicio: "",
          fecha: "",
          observacion: "",
          insumos: [],
        });
        imagePreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
        imagePreviewUrls.current.clear();
        setImagenes([]);
        await obtenerTratamientos();

        if (!isCurrentSession()) return;

        setModal({
          show: true,
          message: "✅ Tratamiento guardado correctamente en la base de datos",
          type: "success",
        });

        try {
          if (!isCurrentSession()) return;
          await descontarInsumos(rol, formData.insumos);

          if (socket) {
            socket.emit("inventarioActualizado", {
              rol,
              insumos: formData.insumos,
            });
          }
        } catch (error) {
          console.error("Error al descontar insumos:", error);
        }
      } else {
        setModal({
          show: true,
          message: "⚠️ Error al guardar el tratamiento",
          type: "error",
        });
      }
    } catch (error) {
      if (!isCurrentSession()) return;
      console.error("Error al guardar tratamiento:", error);
      setModal({
        show: true,
        message: "❌ Error al conectar con el servidor",
        type: "error",
      });
    } finally {
      // Solo se habilita un nuevo intento si el registro no llegó a guardarse.
      if (!tratamientoRegistrado) {
        envioEnCursoRef.current = false;
        setEnviando(false);
        onSubmissionChange(cita, false);
      }
    }
  };

  const handleModalClose = () => {
    cerrarModal();

    if (modal.type === "success" && isCurrentSession()) {
      reloadTimersRef.current.push(setTimeout(() => {
        if (!isCurrentSession()) return;
        setLoading(true);
        reloadTimersRef.current.push(setTimeout(() => {
          if (isCurrentSession()) window.location.reload();
        }, 1000));
      }, 400));
    }
  };

  return (
    <section className="page-section ui-page">
      <div className="page-stack page-stack-narrow">
          <header className="ui-page-header mb-0">
            <div className="min-w-0">
              <p className="ui-eyebrow mb-1">Registro de atención</p>
              <h1 className="ui-title">
                Registrar tratamiento
              </h1>
              <p className="ui-description">
                Completa el registro de atención y los insumos utilizados.
              </p>
            </div>
          </header>

        <div className="ui-panel">
          <form className="space-y-6" onSubmit={handleGuardar}>
            <div className="border-b border-slate-700/50 pb-4">
              <h2 className="text-base font-semibold text-slate-100">Datos de la atención</h2>
              <p className="mt-1 text-sm text-slate-400">Información del paciente y del servicio asociado a la cita.</p>
            </div>
            {hasAppointment && patientStatus === "loading" && (
              <p role="status" className="rounded-xl border border-indigo-400/20 bg-indigo-400/5 px-4 py-3 text-sm text-slate-300">
                Consultando los datos registrados del paciente…
              </p>
            )}
            {hasAppointment && patientStatus === "error" && (
              <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/5 px-4 py-3">
                <p className="text-sm text-rose-200">
                  {patientError || "No fue posible consultar los datos del paciente. Reintenta antes de guardar."}
                </p>
                <button type="button" onClick={retryPatient} className="ui-button ui-button-secondary mt-3">
                  Reintentar consulta
                </button>
              </div>
            )}
            {patientReady && sexoRegistrado && formData.celular && (
              <p className="text-xs text-slate-400">
                Datos del paciente recuperados de sus registros. No es necesario registrarlo nuevamente.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label="Nombre del paciente"
                value={formData.nombre}
                readOnly
              />
              <InputField
                label="Celular"
                type="text"
                placeholder="Ingrese número de celular"
                value={formData.celular}
                readOnly={datosBloqueados}
                maxLength={9}
                error={
                  formData.celular !== "" && !/^\d{9}$/.test(formData.celular)
                    ? "Debe contener 9 dígitos"
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;

                  if (/^\d{0,9}$/.test(value)) {
                    setFormData((previous) => ({ ...previous, celular: value }));
                  }
                }}
              />
            </div>

            <RadioGroup
              label="Sexo"
              name="sexo"
              options={["Masculino", "Femenino"]}
              value={formData.sexo}
              onChange={(e) =>
                !sexoRegistrado && !datosBloqueados &&
                setFormData((previous) => ({ ...previous, sexo: e.target.value }))
              }
              disabled={Boolean(sexoRegistrado) || datosBloqueados}
            />

            <InputField
              label="Tipo de Servicio"
              value={
                Array.isArray(formData.servicio)
                  ? formData.servicio.join(", ")
                  : typeof formData.servicio === "string"
                    ? formData.servicio
                        .split(",")
                        .map((s) => s.trim())
                        .join(", ")
                    : ""
              }
              readOnly
            />

            <div className="rounded-lg border border-slate-700/60 bg-[var(--surface-subtle)] p-4 sm:p-5">
              <label className="mb-4 block text-base font-semibold text-white">
                Insumos utilizados
              </label>

              <div className="search-field mb-4">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  aria-label="Buscar insumo"
                  placeholder="Buscar insumo..."
                  className="search-input"
                  value={busquedaInsumo}
                  onChange={(e) => setBusquedaInsumo(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto custom-scroll">
                {insumosFiltrados.map((insumo) => {
                  const seleccionado = formData.insumos.includes(insumo.nombre);
                  return (
                    <label
                      key={insumo._id}
                      className={`group flex min-w-0 items-start gap-3 p-3 rounded-lg cursor-pointer transition border ${
                        seleccionado
                          ? "bg-indigo-400/10 border-indigo-400/35"
                          : "bg-slate-950/40 border-slate-700 hover:bg-indigo-400/5 hover:border-indigo-400/25"
                      }`}
                    >
                      <CustomChoice
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() => {
                          const nuevos = seleccionado
                            ? formData.insumos.filter(
                                (i) => i !== insumo.nombre,
                              )
                            : [...formData.insumos, insumo.nombre];
                          setFormData({ ...formData, insumos: nuevos });
                        }}
                        disabled={formBloqueado}
                        ariaLabel={`Seleccionar ${insumo.nombre}`}
                      />
                      <span className="min-w-0 text-sm leading-relaxed text-slate-200 capitalize break-words">
                        {insumo.nombre}
                      </span>
                    </label>
                  );
                })}
                {insumosFiltrados.length === 0 && (
                  <p className="col-span-full rounded-lg border border-dashed border-slate-700 px-4 py-5 text-center text-sm text-slate-400">
                    No hay insumos disponibles para {rolProfesional || "este"}{" "}
                    rol.
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-700/50 pt-5">
              <h2 className="text-base font-semibold text-slate-100">Registro del tratamiento</h2>
              <p className="mt-1 text-sm text-slate-400">Observaciones, fecha e imágenes de la atención.</p>
            </div>
            <TextAreaField
              label="Observaciones"
              value={formData.observacion}
              onChange={(e) =>
                setFormData({ ...formData, observacion: e.target.value })
              }
            />

            <FechaField fecha={formData.fecha} />
            <ImageUploader
              imagenes={imagenes}
              onUpload={handleImageChange}
              onRemove={handleRemoveImage}
            />

            <ActionButtons
              onCancel={() => {
                setFormData(fillTreatmentPatient(createInitialForm(cita), patientReady ? patient : null));
                imagePreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
                imagePreviewUrls.current.clear();
                setImagenes([]);
                setCitaSeleccionada(null);
              }}
              disabled={formBloqueado || !patientReady}
              isSubmitting={enviando}
            />
          </form>
        </div>
      </div>

      <ConfirmationModal
        show={modal.show}
        message={modal.message}
        type={modal.type}
        onClose={handleModalClose}
      />

      {loading && <LoadingSpinner />}
    </section>
  );
}
