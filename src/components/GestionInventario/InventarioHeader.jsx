export default function InventarioHeader({
  roles,
  rolSeleccionado,
  setRolSeleccionado,
}) {
  return (
    <div className="flex justify-between mb-8 items-center">
      <h2 className="text-2xl font-bold"></h2>
      <select
        value={rolSeleccionado}
        onChange={(e) => setRolSeleccionado(e.target.value)}
        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 cursor-pointer"
      >
        {roles.map((rol) => (
          <option key={rol}>{rol}</option>
        ))}
      </select>
    </div>
  );
}
