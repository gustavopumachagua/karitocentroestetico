import { useState } from "react";
import { FaSearch, FaSpa } from "react-icons/fa";
import CustomChoice from "../common/CustomChoice";

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
      <label className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
        <FaSpa className="text-violet-300" />
        Servicio(s)
      </label>

      <div
        className={`p-5 rounded-xl bg-slate-950/25 border border-slate-700/70 max-h-72 overflow-y-auto custom-scroll ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {disabled ? (
          <p className="text-slate-400 text-sm">
            Primero seleccione un profesional
          </p>
        ) : serviciosDisponibles.length === 0 ? (
          <p className="text-slate-400 text-sm">No hay servicios disponibles</p>
        ) : (
          <>
            <div className="search-field mb-4">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar servicio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {serviciosFiltrados.length === 0 ? (
                <p className="text-slate-400 text-sm col-span-2 text-center">
                  No se encontraron servicios
                </p>
              ) : (
                serviciosFiltrados.map((serv) => {
                  const seleccionado = serviciosSeleccionados.includes(serv);
                  return (
                    <label
                      key={serv}
                      className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition border ${
                        seleccionado
                          ? "bg-violet-400/10 border-violet-400/35"
                          : "bg-slate-950/40 border-slate-700 hover:bg-cyan-400/5 hover:border-cyan-400/25"
                      }`}
                    >
                      <CustomChoice
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() => onToggle(serv)}
                        accent="violet"
                        ariaLabel={`Seleccionar ${serv}`}
                      />
                      <span className="text-slate-200 capitalize">{serv}</span>
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
