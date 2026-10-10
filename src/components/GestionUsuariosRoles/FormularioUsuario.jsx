import { FaUserPlus, FaUser, FaEnvelope, FaUserShield } from "react-icons/fa";
import CustomSelect from "../common/CustomSelect";

export default function FormularioUsuario({
  nuevoUsuario,
  handleChange,
  handleSubmit,
  formularioValido,
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className="ui-panel"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10">
          <FaUserPlus className="text-cyan-300" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Registrar Nuevo Trabajador
        </h3>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="ui-field">
          <label
            htmlFor="nombre"
            className="ui-label flex items-center gap-2"
          >
            <FaUser className="text-cyan-300" /> Nombre
          </label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={nuevoUsuario.nombre}
            onChange={handleChange}
            placeholder="Ej. María López"
            className="ui-control focus:border-cyan-400/60 focus:ring-cyan-400/15"
            required
          />
        </div>

        <div className="ui-field">
          <label
            htmlFor="email"
            className="ui-label flex items-center gap-2"
          >
            <FaEnvelope className="text-cyan-300" /> Correo
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={nuevoUsuario.email}
            onChange={handleChange}
            placeholder="ejemplo@centro.com"
            className="ui-control focus:border-cyan-400/60 focus:ring-cyan-400/15"
            required
          />
        </div>

        <div className="ui-field">
          <label
            htmlFor="rol"
            className="ui-label flex items-center gap-2"
          >
            <FaUserShield className="text-violet-300" /> Rol
          </label>
          <CustomSelect
            id="rol"
            name="rol"
            value={nuevoUsuario.rol}
            onChange={handleChange}
            accent="violet"
            placeholder="Seleccionar rol"
            options={[
              { value: "", label: "Seleccionar rol" },
              { value: "doctor", label: "Doctor" },
              { value: "cosmiatra", label: "Cosmiatra" },
            ]}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={!formularioValido}
          className={`ui-button w-full min-h-12 ${
            formularioValido
              ? "ui-button-primary"
              : "ui-button-secondary cursor-not-allowed"
          }`}
        >
          <FaUserPlus />
          Registrar Trabajador
        </button>
      </div>
    </form>
  );
}
