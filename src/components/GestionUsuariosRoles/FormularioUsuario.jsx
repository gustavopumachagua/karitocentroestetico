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
      <div className="mb-5">
        <h3 className="text-base font-semibold text-white">
          Registrar trabajador
        </h3>
        <p className="mt-1 text-sm text-slate-400">Añade un profesional y asigna su rol de acceso.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)_auto] xl:items-end">
        <div className="ui-field">
          <label
            htmlFor="nombre"
            className="ui-label flex items-center gap-2"
          >
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={nuevoUsuario.nombre}
            onChange={handleChange}
            placeholder="Ej. María López"
            className="ui-control focus:border-indigo-400/60 focus:ring-indigo-400/15"
            required
          />
        </div>

        <div className="ui-field">
          <label
            htmlFor="email"
            className="ui-label flex items-center gap-2"
          >
            Correo
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={nuevoUsuario.email}
            onChange={handleChange}
            placeholder="ejemplo@centro.com"
            className="ui-control focus:border-indigo-400/60 focus:ring-indigo-400/15"
            required
          />
        </div>

        <div className="ui-field">
          <label
            htmlFor="rol"
            className="ui-label flex items-center gap-2"
          >
            Rol
          </label>
          <CustomSelect
            id="rol"
            name="rol"
            value={nuevoUsuario.rol}
            onChange={handleChange}
            accent="indigo"
            placeholder="Seleccionar rol"
            options={[
              { value: "", label: "Seleccionar rol" },
              { value: "doctor", label: "Doctor" },
              { value: "cosmiatra", label: "Cosmiatra" },
            ]}
          />
        </div>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={!formularioValido}
          className={`ui-button w-full ${
            formularioValido
              ? "ui-button-primary"
              : "ui-button-secondary cursor-not-allowed"
          }`}
        >
          Registrar trabajador
        </button>
      </div>
      </div>
    </form>
  );
}
