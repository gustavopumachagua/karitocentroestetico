import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCitas } from "../../hooks/useCitas";
import { useAuth } from "../../hooks/useAuth";
import { getAuthToken } from "../../services/authStorage";
import { belongsToProfessionalRole } from "../../utils/professionalOwnership";
import { useModal } from "../../hooks/useModal";
import InputField from "../../components/RegistaTratamiento/InputField";
import TextAreaField from "../../components/RegistaTratamiento/TextAreaField";
import RadioGroup from "../../components/RegistaTratamiento/RadioGroup";
import ImageUploader from "../../components/RegistaTratamiento/ImageUploader";
import FechaField from "../../components/RegistaTratamiento/FechaField";
import ActionButtons from "../../components/RegistaTratamiento/ActionButtons";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import { getInventario, descontarInsumos } from "../../api/inventario.api";
import { buscarPaciente } from "../../api/tratamientos.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import CustomChoice from "../../components/common/CustomChoice";

import { FaListUl, FaNotesMedical, FaSearch } from "react-icons/fa";

const INITIAL_FORM = {
  nombre: "",
  sexo: "",
  celular: "",
  servicio: "",
  fecha: "",
  observacion: "",
  insumos: [],
};

export default function RegistrarTratamiento() {
  const {
    citas,
    citaSeleccionada,
    setCitaSeleccionada,
    socket,
    obtenerTratamientos,
  } = useCitas();
  const { nombre: nombreDoctor, rol, user } = useAuth();
  const { modal, setModal, cerrarModal } = useModal();

  const [formBloqueado, setFormBloqueado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insumosDisponibles, setInsumosDisponibles] = useState([]);
  const [busquedaInsumo, setBusquedaInsumo] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [pacienteExistente, setPacienteExistente] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [enviando, setEnviando] = useState(false);
  const envioEnCursoRef = useRef(false);
  const obtenerTratamientosRef = useRef(obtenerTratamientos);

  useEffect(() => {
    obtenerTratamientosRef.current = obtenerTratamientos;
  }, [obtenerTratamientos]);

  const recargarTratamientos = useCallback(
    () => obtenerTratamientosRef.current(),
    [],
  );

  const citasFiltradas = useMemo(
    () =>
      citas.filter((cita) => {
        const estadoPendiente = cita.estado?.toLowerCase() === "pendiente";
        if (!estadoPendiente) return false;

        switch (rol) {
          case "doctor":
          case "cosmiatra":
            return belongsToProfessionalRole(cita, user);

          case "asistente":
            return (
              typeof cita.asistente === "string" &&
              cita.asistente.toLowerCase() === nombreDoctor.toLowerCase()
            );

          case "recepcionista":
            return true;

          default:
            return false;
        }
      }),
    [citas, nombreDoctor, rol, user],
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
    if (citasFiltradas.length > 0) {
      const ahora = new Date();
      const citasOrdenadas = [...citasFiltradas].sort((a, b) => {
        const fechaA = new Date(a.fecha.replace(" ", "T"));
        const fechaB = new Date(b.fecha.replace(" ", "T"));
        return Math.abs(fechaA - ahora) - Math.abs(fechaB - ahora);
      });

      const citaProxima = citasOrdenadas[0];
      if (!citaSeleccionada || citaSeleccionada.id !== citaProxima.id) {
        setCitaSeleccionada(citaProxima);
        setFormData((prev) => ({
          ...prev,
          nombre: citaProxima.cliente || "",
          servicio: citaProxima.servicio || "",
          fecha: citaProxima.fecha || "",
        }));
      }
    }
  }, [citaSeleccionada, citasFiltradas, setCitaSeleccionada]);

  useEffect(() => {
    const buscarPacienteExistente = async () => {
      if (!formData.nombre) return;

      try {
        const data = await buscarPaciente(formData.nombre);
        setFormData((prev) => ({
          ...prev,
          sexo: data.sexo || "",
          celular: data.celular || "",
        }));
        setPacienteExistente(true);
      } catch {
        setPacienteExistente(false);
      }
    };

    buscarPacienteExistente();
  }, [formData.nombre]);

  useEffect(() => {
    if (citaSeleccionada?.estado === "atendido") {
      setFormBloqueado(true);
    } else {
      setFormBloqueado(false);
    }
  }, [citaSeleccionada]);

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
    if (!citaSeleccionada) return;

    setFormData((prev) => {
      return {
        ...prev,
        nombre: prev.nombre || citaSeleccionada.cliente || "",
        servicio: prev.servicio || citaSeleccionada.servicio || "",
        fecha: prev.fecha || citaSeleccionada.fecha || "",
      };
    });
  }, [citaSeleccionada]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const nuevasImagenes = files.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      file,
    }));
    setImagenes([...imagenes, ...nuevasImagenes]);
  };

  const handleRemoveImage = (id) => {
    setImagenes(imagenes.filter((img) => img.id !== id));
  };

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      void recargarTratamientos();
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
    if (envioEnCursoRef.current || formBloqueado) return;

    if (!formData.insumos || formData.insumos.length === 0) {
      setModal({
        show: true,
        message:
          "⚠️ Debes seleccionar al menos un insumo utilizado antes de guardar.",
        type: "error",
      });
      return;
    }

    if (!formData.sexo || !formData.celular) {
      setModal({
        show: true,
        message: "⚠️ Completa los datos del paciente antes de guardar.",
        type: "error",
      });
      return;
    }

    envioEnCursoRef.current = true;
    setEnviando(true);
    let tratamientoRegistrado = false;

    try {
      const token = getAuthToken();
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

      const citaId = citaSeleccionada?._id || citaSeleccionada?.id;
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
          headers: { Authorization: `Bearer ${token}` },
          body: formDataToSend,
        },
      );

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
        setImagenes([]);
        setCitaSeleccionada(null);
        setPacienteExistente(false);

        await obtenerTratamientos();

        setModal({
          show: true,
          message: "✅ Tratamiento guardado correctamente en la base de datos",
          type: "success",
        });

        try {
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
      }
    }
  };

  const handleModalClose = () => {
    cerrarModal();

    if (modal.type === "success") {
      setTimeout(() => {
        setLoading(true);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }, 400);
    }
  };

  return (
    <section className="page-section ui-page">
      <div className="page-stack page-stack-narrow">
        <div className="ui-panel">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-700/50 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10">
              <FaNotesMedical className="text-cyan-300 text-lg" />
            </div>
            <div>
              <p className="ui-eyebrow mb-1">Registro de atención</p>
              <h2 className="text-xl font-semibold text-white">
                Registrar tratamiento
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Completa el registro de atención y los insumos utilizados.
              </p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleGuardar}>
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
                readOnly={formBloqueado}
                maxLength={9}
                error={
                  formData.celular !== "" && !/^\d{9}$/.test(formData.celular)
                    ? "Debe contener 9 dígitos"
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;

                  if (/^\d{0,9}$/.test(value)) {
                    setFormData({ ...formData, celular: value });
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
                !pacienteExistente &&
                setFormData({ ...formData, sexo: e.target.value })
              }
              disabled={pacienteExistente || formBloqueado}
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

            <div className="rounded-xl border border-slate-700/70 bg-slate-950/25 p-5">
              <label className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <FaListUl className="text-cyan-300" />
                Insumos utilizados
              </label>

              <div className="search-field mb-4">
                <FaSearch className="search-icon" />
                <input
                  type="text"
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
                      className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition border ${
                        seleccionado
                          ? "bg-cyan-400/10 border-cyan-400/35"
                          : "bg-slate-950/40 border-slate-700 hover:bg-cyan-400/5 hover:border-cyan-400/25"
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
                      <span className="text-slate-200 capitalize">
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
                setFormData({
                  nombre: "",
                  celular: "",
                  sexo: "",
                  servicio: "",
                  fecha: "",
                  observacion: "",
                  insumos: [],
                });
                setImagenes([]);
                setCitaSeleccionada(null);
                setPacienteExistente(false);
              }}
              disabled={formBloqueado}
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
