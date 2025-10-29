import { FaUserPlus, FaUser, FaEnvelope, FaUserShield } from "react-icons/fa";

export default function FormularioUsuario({
  nuevoUsuario,
  handleChange,
  handleSubmit,
  formularioValido,
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800/70 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300"
    >
      <h3 className="text-lg sm:text-xl font-semibold mb-6 flex items-center gap-2 text-indigo-400">
        <FaUserPlus /> Registrar Nuevo Trabajador
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <div className="flex flex-col">
          <label
            htmlFor="nombre"
            className="text-gray-300 text-sm mb-1 flex items-center gap-2"
          >
            <FaUser className="text-indigo-400" /> Nombre
          </label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={nuevoUsuario.nombre}
            onChange={handleChange}
            placeholder="Ej. María López"
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring focus:ring-indigo-500/30 outline-none transition"
            required
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-gray-300 text-sm mb-1 flex items-center gap-2"
          >
            <FaEnvelope className="text-indigo-400" /> Correo
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={nuevoUsuario.email}
            onChange={handleChange}
            placeholder="ejemplo@centro.com"
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring focus:ring-indigo-500/30 outline-none transition"
            required
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="rol"
            className="text-gray-300 text-sm mb-1 flex items-center gap-2"
          >
            <FaUserShield className="text-indigo-400" /> Rol
          </label>
          <select
            id="rol"
            name="rol"
            value={nuevoUsuario.rol}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 cursor-pointer focus:border-indigo-500 focus:ring focus:ring-indigo-500/30 outline-none transition"
          >
            <option value="">Seleccionar rol</option>
            <option value="doctor">Doctor</option>
            <option value="cosmiatra">Cosmiatra</option>
          </select>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={!formularioValido}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
            formularioValido
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.02] shadow-md"
              : "bg-gray-600 cursor-not-allowed opacity-70"
          }`}
        >
          <FaUserPlus />
          Registrar Trabajador
        </button>
      </div>
    </form>
  );
}
