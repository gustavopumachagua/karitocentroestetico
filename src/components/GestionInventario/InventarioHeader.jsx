import CustomSelect from "../common/CustomSelect";

export default function InventarioHeader({
  roles,
  rolSeleccionado,
  setRolSeleccionado,
}) {
  return (
    <div className="ui-toolbar border-b border-slate-700/60 pb-4">
      <div>
        <p className="text-sm font-semibold text-slate-200">Catálogo por área</p>
        <p className="mt-1 text-sm text-slate-400">Selecciona el área para consultar sus insumos y servicios.</p>
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
