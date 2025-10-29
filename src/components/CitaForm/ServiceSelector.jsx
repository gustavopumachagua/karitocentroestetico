import { useState } from "react";

export default function ServiceSelector({
  serviciosDisponibles,
  serviciosSeleccionados,
  onToggle,
  disabled,
}) {
  const [busqueda, setBusqueda] = useState("");

  const serviciosFiltrados = serviciosDisponibles.filter((serv) =>
    serv.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="col-span-1 md:col-span-2">
      <label className="block text-gray-200 mb-4 font-semibold text-lg flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l2 2h6a2 2 0 012 2v12a2 2 0 01-2 2z"
          />
        </svg>
        Servicio(s)
      </label>

      <div
        className={`p-5 rounded-xl bg-gray-700/40 border border-gray-600 shadow-inner max-h-72 overflow-y-auto custom-scroll ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {disabled ? (
          <p className="text-gray-400 text-sm">
            Primero seleccione un profesional
          </p>
        ) : serviciosDisponibles.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay servicios disponibles</p>
        ) : (
          <>
            <input
              type="text"
              placeholder="Buscar servicio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full mb-4 p-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {serviciosFiltrados.length === 0 ? (
                <p className="text-gray-400 text-sm col-span-2 text-center">
                  No se encontraron servicios
                </p>
              ) : (
                serviciosFiltrados.map((serv) => {
                  const seleccionado = serviciosSeleccionados.includes(serv);
                  return (
                    <label
                      key={serv}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition border ${
                        seleccionado
                          ? "bg-indigo-600/20 border-indigo-500"
                          : "bg-gray-800 border-gray-700 hover:bg-gray-700/70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() => onToggle(serv)}
                        className="accent-indigo-500 w-4 h-4"
                      />
                      <span className="text-gray-200 capitalize">{serv}</span>
                    </label>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
