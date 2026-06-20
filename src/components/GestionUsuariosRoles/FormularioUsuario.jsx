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
      className="page-panel page-panel-pad"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10">
          <FaUserPlus className="text-cyan-300" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Registrar Nuevo Trabajador
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <div className="flex flex-col">
          <label
            htmlFor="nombre"
            className="text-slate-300 text-sm mb-2 flex items-center gap-2"
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
            className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15"
            required
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-slate-300 text-sm mb-2 flex items-center gap-2"
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
            className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15"
            required
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="rol"
            className="text-slate-300 text-sm mb-2 flex items-center gap-2"
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
          className={`w-full flex items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white transition-all duration-300 ${
            formularioValido
              ? "bg-gradient-to-r from-cyan-600 to-violet-600 shadow-md shadow-cyan-950/30 hover:from-cyan-500 hover:to-violet-500 hover:scale-[1.01] cursor-pointer"
              : "bg-slate-700 text-slate-400 cursor-not-allowed opacity-70"
          }`}
        >
          <FaUserPlus />
          Registrar Trabajador
        </button>
      </div>
    </form>
  );
}
