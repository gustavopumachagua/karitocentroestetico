import { useState } from "react";
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
  const [calendarioAbierto, setCalendarioAbierto] = useState(false);

  const handleDateChange = (date) => {
    if (!date) return;
    setFiltroAnio(date.getFullYear());
    setFiltroMes(date.getMonth() + 1);
    setCalendarioAbierto(false);
  };

  const handleClear = () => {
    setFiltroMes("");
    setFiltroAnio(new Date().getFullYear());
  };

  return (
    <div
      className={`ui-panel ui-report-filters min-w-0 w-full ${
        calendarioAbierto ? "relative z-20" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3 mb-5">
        <div
          className="ui-chart-icon"
        >
          <FaFilter className="text-sm" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
          Filtros de Reporte
        </h3>
      </div>

      <div className="grid min-w-0 grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end">
        <div className="min-w-0 flex flex-col">
          <label className="ui-label mb-2 flex items-center gap-2">
            <FaCalendarAlt className="text-indigo-300 text-xs" /> Seleccionar
            Mes / Año
          </label>
          <DatePicker
            selected={filtroMes ? new Date(filtroAnio, filtroMes - 1) : null}
            onChange={handleDateChange}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            locale="es"
            placeholderText="Seleccionar una fecha"
            onCalendarOpen={() => setCalendarioAbierto(true)}
            onCalendarClose={() => setCalendarioAbierto(false)}
            popperPlacement="bottom-start"
            wrapperClassName="min-w-0 w-full"
            popperClassName="app-datepicker-popper"
            calendarClassName="app-datepicker-calendar"
            className="ui-control min-h-11 w-full px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-400"
          />
        </div>
        <button
          onClick={handleClear}
          className="ui-button ui-button-secondary min-h-11 w-full sm:w-auto"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
