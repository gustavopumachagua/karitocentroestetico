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
    <div className="page-panel page-panel-pad mx-auto w-full max-w-4xl">
      <div className="flex items-center justify-center gap-2 mb-4">
        <FaFilter className="text-cyan-300 text-lg" />
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Filtros de Reporte
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
        <div className="flex flex-col">
          <label className="text-gray-300 text-sm mb-1 flex items-center gap-2">
            <FaCalendarAlt className="text-yellow-400" /> Seleccionar Mes / Año
          </label>
          <DatePicker
            selected={filtroMes ? new Date(filtroAnio, filtroMes - 1) : null}
            onChange={handleDateChange}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            locale="es"
            placeholderText="Seleccionar una fecha"
            className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-gray-200 outline-none placeholder-gray-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20 sm:text-base"
          />
        </div>
        <button
          onClick={handleClear}
          className="mt-5 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300 sm:mt-0"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
