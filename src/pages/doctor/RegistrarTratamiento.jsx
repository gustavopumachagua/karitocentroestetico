import { useState, useEffect } from "react";
import { useCitas } from "../../context/CitasContext";
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

import { FaListUl, FaNotesMedical, FaSearch } from "react-icons/fa";

export default function RegistrarTratamiento() {
  const { citas, citaSeleccionada, setCitaSeleccionada } = useCitas();
  const [formBloqueado, setFormBloqueado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insumosDisponibles, setInsumosDisponibles] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [pacienteExistente, setPacienteExistente] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    sexo: "",
    celular: "",
    servicio: "",
    fecha: "",
    observacion: "",
    insumos: "",
  });

  const [modal, setModal] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const nombreDoctor = user?.nombre || "";
  const rol = user?.rol?.toLowerCase() || "";

  const citasFiltradas = citas.filter((cita) => {
    const estadoPendiente = cita.estado?.toLowerCase() === "pendiente";
    const user = JSON.parse(localStorage.getItem("user"));
    const rol = user?.rol?.toLowerCase();
    const nombre = user?.nombre?.toLowerCase();

    if (!estadoPendiente) return false;

    switch (rol) {
      case "doctor":
      case "cosmiatra":
        return (
          cita.profesional &&
          typeof cita.profesional === "object" &&
          cita.profesional.nombre?.toLowerCase() === nombre
        );

      case "asistente":
        return (
          typeof cita.asistente === "string" &&
          cita.asistente.toLowerCase() === nombre
        );

      case "recepcionista":
        return true;

      default:
        return false;
    }
  });

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
  }, [citasFiltradas]);

  useEffect(() => {
    const buscarPaciente = async () => {
      if (!formData.nombre) return;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/tratamientos/buscar/${encodeURIComponent(formData.nombre)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({
            ...prev,
            sexo: data.sexo || "",
            celular: data.celular || "",
          }));
          setPacienteExistente(true);
        } else {
          setPacienteExistente(false);
        }
      } catch (error) {
        console.error("Error al buscar paciente:", error);
        setPacienteExistente(false);
      }
    };

    buscarPaciente();
  }, [formData.nombre]);

  useEffect(() => {
    if (citaSeleccionada?.estado === "atendido") {
      setFormBloqueado(true);
    } else {
      setFormBloqueado(false);
    }
  }, [citaSeleccionada]);

  useEffect(() => {
    const obtenerInsumos = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        const rol = user?.rol?.toLowerCase() || "doctor";

        const data = await getInventario(rol, token);
        if (Array.isArray(data)) setInsumosDisponibles(data);
      } catch (error) {
        console.error("Error al obtener insumos:", error);
      }
    };
    obtenerInsumos();
  }, []);

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

  const { socket, obtenerTratamientos } = useCitas();

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      obtenerTratamientos();
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
  }, [socket]);

  const handleGuardar = async (e) => {
    e.preventDefault();

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

    try {
      const token = localStorage.getItem("token");
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
          await descontarInsumos(rol, formData.insumos, token);

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
    }
  };

  const handleModalClose = () => {
    setModal((prev) => ({ ...prev, show: false }));

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
    <section className="page-section">
      <div className="page-stack page-stack-narrow">
        <div className="page-panel page-panel-pad">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-700/50 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10">
              <FaNotesMedical className="text-cyan-300 text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Registrar tratamiento
              </h2>
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
                  onChange={(e) => {
                    const filtro = e.target.value.toLowerCase();
                    setInsumosDisponibles((prev) =>
                      prev.map((insumo) => ({
                        ...insumo,
                        visible: insumo.nombre.toLowerCase().includes(filtro),
                      })),
                    );
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto custom-scroll">
                {insumosDisponibles
                  .filter((insumo) => insumo.visible !== false)
                  .map((insumo) => {
                    const seleccionado = formData.insumos.includes(
                      insumo.nombre,
                    );
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
