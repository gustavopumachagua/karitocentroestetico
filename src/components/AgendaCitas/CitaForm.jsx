import { useState, useEffect, useMemo } from "react";
import FormSelect from "../CitaForm/FormSelect";
import FormDateTime from "../CitaForm/FormDateTime";
import ServiceSelector from "../CitaForm/ServiceSelector";
import SubmitButton from "../CitaForm/SubmitButton";

export default function CitaForm({ usuarios, onRegistrarCita }) {
  const [nuevaCita, setNuevaCita] = useState({
    cliente: "",
    rol: "",
    profesional: "",
    servicio: [],
    fecha: "",
  });

  const [servicios, setServicios] = useState([]);
  const [errorCliente, setErrorCliente] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [valorSeleccionado, setValorSeleccionado] = useState("");

  useEffect(() => {
    if (!nuevaCita.rol) return;
    fetch(`${import.meta.env.VITE_API_URL}/inventario/${nuevaCita.rol}`)
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
  }, [nuevaCita.cliente]);

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

    setNuevaCita({ ...nuevaCita, [name]: value });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegistrarCita(nuevaCita);
    setNuevaCita({
      cliente: "",
      rol: "",
      profesional: "",
      servicio: [],
      fecha: "",
    });
    setSugerencias([]);
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

      <SubmitButton disabled={!isFormValid}>Registrar Cita</SubmitButton>
    </form>
  );
}
