export default function InventarioTable({ data, mostrarSoloBajos }) {
  const inventarioFiltrado = mostrarSoloBajos
    ? data.filter((item) => item.cantidad < item.umbral)
    : data;

  return (
    <section className="bg-gradient-to-br from-gray-800/70 via-gray-900/70 to-gray-800/70 border border-gray-700/60 rounded-3xl p-6 shadow-xl hover:shadow-red-500/10 transition-all duration-300">
      <h3 className="text-lg sm:text-xl font-semibold text-red-400 mb-6 text-center tracking-wide">
        Estado de Stock de Insumos
      </h3>

      {inventarioFiltrado.length === 0 ? (
        <p className="text-gray-400 text-center italic py-8">
          {mostrarSoloBajos
            ? "✅ Todos los insumos tienen stock suficiente."
            : "No hay insumos registrados en el inventario."}
        </p>
      ) : (
        <div className="overflow-y-auto max-h-[420px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 rounded-2xl">
          <table className="min-w-full border-collapse text-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-700 border-b border-gray-600 uppercase text-gray-300 text-xs sticky top-0 z-10">
                <th className="p-3 text-left">Insumo</th>
                <th className="p-3 text-center">Cantidad</th>
                <th className="p-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {inventarioFiltrado.map((item, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-700/50 hover:bg-gray-800/60 transition-colors"
                >
                  <td className="p-3 font-medium">{item.insumo}</td>
                  <td className="p-3 text-center">{item.cantidad}</td>
                  <td className="p-3 text-center">
                    {item.cantidad < item.umbral ? (
                      <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                        <span className="text-lg leading-none">⚠</span> Bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-400 font-semibold">
                        <span className="text-lg leading-none">✔</span> OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
