import { useState, useEffect, useMemo, useRef } from "react";
import FormSelect from "../CitaForm/FormSelect";
import FormDateTime from "../CitaForm/FormDateTime";
import ServiceSelector from "../CitaForm/ServiceSelector";
import SubmitButton from "../CitaForm/SubmitButton";
import { FaCalendarAlt, FaSearch, FaTimes, FaTrash } from "react-icons/fa";
import { formatearFechaCitaParaInput } from "../../utils/citasFecha";
import { getInventario } from "../../api/inventario.api";
import { buscarCitas } from "../../api/citas.api";
import { normalizePatientSuggestions } from "../../utils/appointmentPatientSuggestions";

const citaVacia = {
  cliente: "",
  rol: "",
  profesional: "",
  servicio: [],
  fecha: "",
};

function crearClaveIdempotencia() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

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
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [errorServicios, setErrorServicios] = useState("");
  const [errorCliente, setErrorCliente] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [valorSeleccionado, setValorSeleccionado] = useState("");
  const [enviando, setEnviando] = useState(false);
  const envioEnCursoRef = useRef(false);
  const claveIdempotenciaRef = useRef(crearClaveIdempotencia());

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
      setCargandoServicios(false);
      setErrorServicios("");
      return;
    }

    let isCurrent = true;

    const cargarServicios = async () => {
      setCargandoServicios(true);
      setErrorServicios("");

      try {
        const data = await getInventario(nuevaCita.rol, {
          tipo: "servicio",
        });
        if (!isCurrent) return;
        const serviciosDelRol = (Array.isArray(data) ? data : [])
          .filter((item) => item.tipo === "servicio")
          .map((item) => item.nombre);
        setServicios(serviciosDelRol);
      } catch (error) {
        if (isCurrent) {
          setServicios([]);
          setErrorServicios(
            "No fue posible cargar los servicios de esta especialidad."
          );
        }
        console.error("Error al obtener servicios:", error);
      } finally {
        if (isCurrent) setCargandoServicios(false);
      }
    };

    cargarServicios();
    return () => {
      isCurrent = false;
    };
  }, [nuevaCita.rol]);

  const profesionalesFiltrados = useMemo(
    () => usuarios.filter((u) => u.rol === nuevaCita.rol),
    [nuevaCita.rol, usuarios]
  );

  useEffect(() => {
    const valor = nuevaCita.cliente.trim();
    let isCurrent = true;

    if (valor.length < 2) {
      setSugerencias([]);
      return;
    }

    if (valorSeleccionado === valor) return;

    const buscarClientes = async () => {
      try {
        setCargando(true);
        const data = await buscarCitas(valor);
        if (isCurrent) setSugerencias(normalizePatientSuggestions(data));
      } catch (error) {
        console.error("Error en autocompletado:", error);
        if (isCurrent) setSugerencias([]);
      } finally {
        if (isCurrent) setCargando(false);
      }
    };

    const delay = setTimeout(buscarClientes, 300);
    return () => {
      isCurrent = false;
      clearTimeout(delay);
    };
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
      setValorSeleccionado("");
      setSugerencias([]);
      setCargando(false);
    }

    setNuevaCita((prev) => {
      if (name === "rol") {
        return { ...prev, rol: value, profesional: "", servicio: [] };
      }
      if (name === "cliente") {
        const { citaPacienteId: _previousSource, ...remaining } = prev;
        return { ...remaining, cliente: value };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleSuggestionClick = (suggestion) => {
    setNuevaCita((prev) => ({ ...prev, cliente: suggestion.nombre, citaPacienteId: suggestion.citaPacienteId }));
    setValorSeleccionado(suggestion.nombre);
    setSugerencias([]);
    setCargando(false);
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
    claveIdempotenciaRef.current = crearClaveIdempotencia();
  };

  const isFormValid =
    nuevaCita.cliente.trim() &&
    nuevaCita.rol &&
    nuevaCita.profesional &&
    nuevaCita.fecha &&
    nuevaCita.servicio.length > 0 &&
    !errorCliente;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid || envioEnCursoRef.current) return;

    envioEnCursoRef.current = true;
    setEnviando(true);

    try {
      const operacionExitosa = estaEditando
        ? await onActualizarCita(nuevaCita)
        : await onRegistrarCita({
            ...nuevaCita,
            idempotencyKey: claveIdempotenciaRef.current,
          });

      if (operacionExitosa === false) return;

      resetFormulario();
    } finally {
      envioEnCursoRef.current = false;
      setEnviando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className="ui-panel relative mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2"
    >
      <div className="ui-toolbar md:col-span-2 border-b border-slate-700/50 pb-5">
        <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10">
          <FaCalendarAlt className="text-cyan-300 text-lg" />
        </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {estaEditando ? "Editar cita" : "Registrar cita"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {estaEditando
                ? "Actualiza los datos y conserva la agenda al día."
                : "Completa los datos para reservar una nueva atención."}
            </p>
          </div>
        </div>
      </div>

      <div className="ui-field relative">
        <label className="ui-label">Cliente</label>
        <div
          className={`search-field ${
            errorCliente ? "border-rose-400/70" : ""
          }`}
        >
          <FaSearch className="search-icon" />
          <input
            type="text"
            name="cliente"
            value={nuevaCita.cliente}
            onChange={handleChange}
            placeholder="Nombre del cliente"
            autoComplete="off"
            spellCheck="false"
            className="search-input"
          />
        </div>

        {sugerencias.length > 0 && (
          <ul className="search-suggestion-list">
            {sugerencias.map((s) => (
              <li
                key={s.citaPacienteId || `nombre:${s.nombre}`}
                onClick={() => handleSuggestionClick(s)}
                className="search-suggestion-item"
              >
                {s.nombre}
              </li>
            ))}
          </ul>
        )}

        {cargando && (
          <span className="absolute top-full mt-1 text-slate-400 text-xs">
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
        cargando={cargandoServicios}
        error={errorServicios}
        rolSeleccionado={nuevaCita.rol}
      />

      <SubmitButton disabled={!isFormValid || enviando}>
        {enviando
          ? estaEditando
            ? "Guardando..."
            : "Registrando..."
          : estaEditando
          ? "Guardar cambios"
          : "Registrar Cita"}
      </SubmitButton>

      {estaEditando && (
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancelarEdicion}
            className="ui-button ui-button-secondary w-full"
          >
            <FaTimes />
            Cancelar edición
          </button>
          <button
            type="button"
            onClick={onEliminarCita}
            className="ui-button ui-button-danger w-full"
          >
            <FaTrash />
            Eliminar cita
          </button>
        </div>
      )}
    </form>
  );
}
