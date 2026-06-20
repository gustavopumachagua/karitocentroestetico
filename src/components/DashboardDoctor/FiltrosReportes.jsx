import { FaFilter, FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import { registerLocale } from "react-datepicker";

registerLocale("es", es);

export default function FiltrosReportes({
  filtroAnio,
  setFiltroAnio,
  filtroMes,
  setFiltroMes,
}) {
  const handleDateChange = (date) => {
    if (!date) return;
    setFiltroAnio(date.getFullYear());
    setFiltroMes(date.getMonth() + 1);
  };

  const handleClear = () => {
    setFiltroMes("");
    setFiltroAnio(new Date().getFullYear());
  };

  return (
    <div className="glass-card p-6 mx-auto w-full max-w-4xl">
      <div className="flex items-center justify-center gap-2 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: 'rgba(34, 211, 238, 0.10)', border: '1px solid rgba(34, 211, 238, 0.15)' }}
        >
          <FaFilter className="text-cyan-300 text-sm" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
          Filtros de Reporte
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
        <div className="flex flex-col">
          <label className="text-slate-400 text-sm mb-2 flex items-center gap-2">
            <FaCalendarAlt className="text-amber-400/80 text-xs" /> Seleccionar Mes / Año
          </label>
          <DatePicker
            selected={filtroMes ? new Date(filtroAnio, filtroMes - 1) : null}
            onChange={handleDateChange}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            locale="es"
            placeholderText="Seleccionar una fecha"
            className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 outline-none placeholder-slate-600 transition-all duration-200 focus:ring-2 focus:ring-cyan-400/20 sm:text-base"
            style={{
              background: 'rgba(12, 20, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.10)',
            }}
          />
        </div>
        <button
          onClick={handleClear}
          className="rounded-xl px-5 py-2.5 font-semibold text-slate-950 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/15 active:scale-[0.97] sm:mt-0"
          style={{
            background: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
            border: '1px solid rgba(34, 211, 238, 0.35)',
          }}
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
