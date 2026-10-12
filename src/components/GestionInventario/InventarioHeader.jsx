import CustomSelect from "../common/CustomSelect";

export default function InventarioHeader({
  roles,
  rolSeleccionado,
  setRolSeleccionado,
}) {
  return (
    <div className="ui-toolbar rounded-xl border border-slate-800/80 bg-slate-950/20 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-200">Área de trabajo</p>
        <p className="mt-1 text-xs text-slate-400">Elige el rol para administrar su catálogo.</p>
      </div>
      <CustomSelect
        value={rolSeleccionado}
        onValueChange={setRolSeleccionado}
        placeholder="Seleccionar rol"
        className="w-full sm:w-56"
        options={roles.map((rol) => ({ value: rol, label: rol }))}
      />
    </div>
  );
}
