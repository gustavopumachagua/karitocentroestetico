import { useState } from "react";
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
      className={`ui-panel ui-report-filters flex min-w-0 w-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between ${
        calendarioAbierto ? "relative z-20" : ""
      }`}
    >
      <div className="min-w-0 lg:pb-1">
        <h3 className="text-base font-semibold text-white tracking-tight">
          Período del reporte
        </h3>
        <p className="mt-1 text-sm text-slate-400">Consulta la actividad y compara tus resultados.</p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 items-end sm:grid-cols-[minmax(0,1fr)_auto] lg:w-[26rem] lg:shrink-0">
        <div className="min-w-0 flex flex-col">
          <label htmlFor="report-period" className="ui-label mb-2">
            Mes y año
          </label>
          <DatePicker
            id="report-period"
            selected={filtroMes ? new Date(filtroAnio, filtroMes - 1) : null}
            onChange={handleDateChange}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            locale="es"
            placeholderText={`Todo el año ${filtroAnio}`}
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
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
