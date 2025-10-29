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
    <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 sm:p-6 mb-8 shadow-md max-w-4xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-4">
        <FaFilter className="text-indigo-400 text-lg" />
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
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base w-full placeholder-gray-400"
          />
        </div>
        <button
          onClick={handleClear}
          className="bg-indigo-600 hover:bg-indigo-700 transition text-white font-medium rounded-lg px-4 py-2 mt-5 sm:mt-0 cursor-pointer"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
