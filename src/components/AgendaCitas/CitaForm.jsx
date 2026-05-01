import { useState, useEffect, useMemo } from "react";
import FormSelect from "../CitaForm/FormSelect";
import FormDateTime from "../CitaForm/FormDateTime";
import ServiceSelector from "../CitaForm/ServiceSelector";
import SubmitButton from "../CitaForm/SubmitButton";
import { FaTimes, FaTrash } from "react-icons/fa";
import { formatearFechaCitaParaInput } from "../../utils/citasFecha";

const citaVacia = {
  cliente: "",
  rol: "",
  profesional: "",
  servicio: [],
  fecha: "",
};

function obtenerNombreCliente(cita) {
  return typeof cita?.cliente === "object"
    ? cita.cliente?.nombre
    : cita?.cliente;
}

function obtenerIdProfesional(cita) {
  return typeof cita?.profesional === "object"
    ? cita.profesional?._id
    : cita?.profesional;
}

export default function CitaForm({
  usuarios,
  onRegistrarCita,
  citaEditando,
  onActualizarCita,
  onEliminarCita,
  onCancelarEdicion,
}) {
  const [nuevaCita, setNuevaCita] = useState(citaVacia);

  const [servicios, setServicios] = useState([]);
  const [errorCliente, setErrorCliente] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [valorSeleccionado, setValorSeleccionado] = useState("");

  const estaEditando = Boolean(citaEditando);

  useEffect(() => {
    if (!citaEditando) {
      setNuevaCita(citaVacia);
      setErrorCliente("");
      setSugerencias([]);
      setValorSeleccionado("");
      return;
    }

    const cliente = obtenerNombreCliente(citaEditando) || "";

    setNuevaCita({
      _id: citaEditando._id || citaEditando.id,
      cliente,
      rol: citaEditando.rol || "",
      profesional: obtenerIdProfesional(citaEditando) || "",
      servicio: Array.isArray(citaEditando.servicio)
        ? citaEditando.servicio
        : [],
      fecha: formatearFechaCitaParaInput(citaEditando.fecha),
    });
    setErrorCliente("");
    setSugerencias([]);
    setValorSeleccionado(cliente);
  }, [citaEditando]);

  useEffect(() => {
    if (!nuevaCita.rol) {
      setServicios([]);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/inventario/${nuevaCita.rol}`)
      .then((res) => res.json())
      .then((data) => {
        const serviciosDelRol = data
          .filter((item) => item.tipo === "servicio")
          .map((item) => item.nombre);
        setServicios(serviciosDelRol);
      })
      .catch((err) => console.error("Error al obtener servicios:", err));
  }, [nuevaCita.rol]);

  const profesionalesFiltrados = useMemo(
    () => usuarios.filter((u) => u.rol === nuevaCita.rol),
    [nuevaCita.rol, usuarios]
  );

  useEffect(() => {
    const valor = nuevaCita.cliente.trim();

    if (valor.length < 2) {
      setSugerencias([]);
      return;
    }

    if (valorSeleccionado === valor) return;

    const buscarClientes = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/citas/buscar?nombre=${encodeURIComponent(valor)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Error al buscar clientes");
        const data = await res.json();

        const nombres = [...new Set(data.map((d) => d.nombre))];
        setSugerencias(nombres);
      } catch (error) {
        console.error("Error en autocompletado:", error);
        setSugerencias([]);
      } finally {
        setCargando(false);
      }
    };

    const delay = setTimeout(buscarClientes, 300);
    return () => clearTimeout(delay);
  }, [nuevaCita.cliente, valorSeleccionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cliente") {
      const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
      if (!regex.test(value)) {
        setErrorCliente("Solo se permiten letras y espacios.");
        return;
      } else {
        setErrorCliente("");
      }
    }

    setNuevaCita((prev) => {
      if (name === "rol") {
        return { ...prev, rol: value, profesional: "", servicio: [] };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleSuggestionClick = (nombre) => {
    setNuevaCita((prev) => ({ ...prev, cliente: nombre }));
    setValorSeleccionado(nombre);
    setSugerencias([]);
    setTimeout(() => document.activeElement.blur(), 100);
  };

  const handleServiceToggle = (serv) => {
    const updatedServices = nuevaCita.servicio.includes(serv)
      ? nuevaCita.servicio.filter((s) => s !== serv)
      : [...nuevaCita.servicio, serv];
    setNuevaCita({ ...nuevaCita, servicio: updatedServices });
  };

  const resetFormulario = () => {
    setNuevaCita(citaVacia);
    setSugerencias([]);
    setValorSeleccionado("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const operacionExitosa = estaEditando
      ? await onActualizarCita(nuevaCita)
      : await onRegistrarCita(nuevaCita);

    if (operacionExitosa === false) return;

    resetFormulario();
  };

  const isFormValid =
    nuevaCita.cliente.trim() &&
    nuevaCita.rol &&
    nuevaCita.profesional &&
    nuevaCita.fecha &&
    nuevaCita.servicio.length > 0 &&
    !errorCliente;

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className="max-w-4xl mx-auto bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6 relative"
    >
      <div className="flex flex-col relative">
        <label className="text-sm text-gray-300 mb-1">Cliente</label>
        <input
          type="text"
          name="cliente"
          value={nuevaCita.cliente}
          onChange={handleChange}
          placeholder="Nombre del cliente"
          autoComplete="off"
          spellCheck="false"
          className={`p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
            errorCliente
              ? "focus:ring-red-500 border border-red-500"
              : "focus:ring-indigo-500"
          }`}
        />

        {sugerencias.length > 0 && (
          <ul className="absolute top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 w-full max-h-40 overflow-y-auto">
            {sugerencias.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSuggestionClick(s)}
                className="px-3 py-2 cursor-pointer hover:bg-indigo-600 hover:text-white text-gray-200 text-sm"
              >
                {s}
              </li>
            ))}
          </ul>
        )}

        {cargando && (
          <span className="absolute top-full mt-1 text-gray-400 text-xs">
            Buscando clientes...
          </span>
        )}

        {errorCliente && (
          <span className="text-red-400 text-sm mt-1">{errorCliente}</span>
        )}
      </div>

      <FormSelect
        label="Rol"
        name="rol"
        value={nuevaCita.rol}
        onChange={handleChange}
        options={["doctor", "cosmiatra"]}
      />

      <FormSelect
        label="Profesional"
        name="profesional"
        value={nuevaCita.profesional}
        onChange={handleChange}
        options={profesionalesFiltrados.map((u) => ({
          label: u.nombre,
          value: u._id,
        }))}
        disabled={!nuevaCita.rol}
      />

      <FormDateTime
        label="Fecha y Hora"
        name="fecha"
        value={nuevaCita.fecha}
        onChange={handleChange}
      />

      <ServiceSelector
        serviciosDisponibles={servicios}
        serviciosSeleccionados={nuevaCita.servicio}
        onToggle={handleServiceToggle}
        disabled={!nuevaCita.rol}
      />

      <SubmitButton disabled={!isFormValid}>
        {estaEditando ? "Guardar cambios" : "Registrar Cita"}
      </SubmitButton>

      {estaEditando && (
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancelarEdicion}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition cursor-pointer"
          >
            <FaTimes />
            Cancelar edición
          </button>
          <button
            type="button"
            onClick={onEliminarCita}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition cursor-pointer"
          >
            <FaTrash />
            Eliminar cita
          </button>
        </div>
      )}
    </form>
  );
}
