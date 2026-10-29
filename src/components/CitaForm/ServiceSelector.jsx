import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import CustomChoice from "../common/CustomChoice";

export default function ServiceSelector({
  serviciosDisponibles,
  serviciosSeleccionados,
  onToggle,
  disabled,
  cargando = false,
  error = "",
  rolSeleccionado = "",
}) {
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    setBusqueda("");
  }, [rolSeleccionado]);

  const serviciosFiltrados = serviciosDisponibles.filter((serv) =>
    serv.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-w-0 col-span-1 md:col-span-2">
      <label className="ui-label mb-3 block">
        Servicio(s)
      </label>

      <div
        className={`min-w-0 max-h-72 overflow-y-auto rounded-lg border border-slate-700 bg-[var(--surface-subtle)] p-3 custom-scroll sm:p-4 ${
          disabled ? "pointer-events-none" : ""
        }`}
      >
        {disabled ? (
          <p className="text-slate-400 text-sm">
            Primero seleccione el rol del profesional
          </p>
        ) : cargando ? (
          <p className="text-slate-400 text-sm" role="status">
            Cargando servicios de {rolSeleccionado}...
          </p>
        ) : error ? (
          <p className="text-rose-300 text-sm" role="alert">
            {error}
          </p>
        ) : serviciosDisponibles.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No hay servicios habilitados para {rolSeleccionado}.
          </p>
        ) : (
          <>
            <div className="search-field mb-4">
              <FaSearch className="search-icon" />
              <input
                type="text"
                aria-label="Buscar servicio"
                placeholder="Buscar servicio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {serviciosFiltrados.length === 0 ? (
                <p className="text-slate-400 text-sm col-span-full text-center">
                  No se encontraron servicios
                </p>
              ) : (
                serviciosFiltrados.map((serv) => {
                  const seleccionado = serviciosSeleccionados.includes(serv);
                  return (
                    <label
                      key={serv}
                      className={`group flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                        seleccionado
                          ? "bg-indigo-400/10 border-indigo-400/45"
                          : "bg-slate-950/40 border-slate-700 hover:bg-indigo-400/5 hover:border-indigo-400/40"
                      }`}
                    >
                      <CustomChoice
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() => onToggle(serv)}
                        accent="violet"
                        ariaLabel={`Seleccionar ${serv}`}
                      />
                      <span className="min-w-0 break-words text-sm text-slate-200 capitalize">{serv}</span>
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
