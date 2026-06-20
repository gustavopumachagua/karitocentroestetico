import { forwardRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import { FaCalendarAlt } from "react-icons/fa";
import CustomSelect from "./CustomSelect";

registerLocale("es", es);

const accentStyles = {
  cyan: {
    focus: "focus:border-cyan-400/60 focus:ring-cyan-400/15",
    icon: "text-cyan-300",
  },
  emerald: {
    focus: "focus:border-emerald-400/60 focus:ring-emerald-400/15",
    icon: "text-emerald-300",
  },
};

function pad(value) {
  return String(value).padStart(2, "0");
}

const hourOptions = Array.from({ length: 24 }, (_, hour) => {
  const value = pad(hour);
  return { value, label: value };
});

const minuteOptions = Array.from({ length: 60 }, (_, minute) => {
  const value = pad(minute);
  return { value, label: value };
});

function parseLocalDate(value) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function parseLocalDateTime(value) {
  if (!value) return null;

  const [datePart, timePart = "00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours = 0, minutes = 0] = timePart.split(":").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day, hours, minutes);
}

function formatLocalDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatLocalDateTime(date) {
  return `${formatLocalDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const DateInput = forwardRef(function DateInput(
  {
    value,
    onClick,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    placeholder,
    disabled,
    accent = "cyan",
    className = "",
    id,
    name,
    autoComplete,
    readOnly,
    required,
    tabIndex,
  },
  ref,
) {
  const styles = accentStyles[accent] || accentStyles.cyan;

  return (
    <div className="relative w-full">
      <FaCalendarAlt
        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm ${styles.icon}`}
      />
      <input
        ref={ref}
        id={id}
        name={name}
        type="text"
        value={value || ""}
        onClick={onClick}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        readOnly={readOnly}
        required={required}
        tabIndex={tabIndex}
        inputMode="numeric"
        className={`min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950/50 py-2.5 pl-11 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${styles.focus} ${className}`}
      />
    </div>
  );
});

function TimeInput({ value = "", onChange }) {
  const [rawHour = "00", rawMinute = "00"] = value.split(":");
  const hour = rawHour || "00";
  const minute = rawMinute || "00";

  const handleHourChange = (nextHour) => {
    onChange(`${nextHour}:${minute}`);
  };

  const handleMinuteChange = (nextMinute) => {
    onChange(`${hour}:${nextMinute}`);
  };

  return (
    <div className="app-time-select-grid">
      <div className="app-time-select-column">
        <span className="app-time-select-label">Hora</span>
        <CustomSelect
          value={hour}
          onValueChange={handleHourChange}
          options={hourOptions}
          size="sm"
          className="w-full"
          buttonClassName="rounded-xl border-slate-700/70 bg-slate-950/55"
          menuClassName="max-h-56"
          ariaLabel="Seleccionar hora"
        />
      </div>
      <div className="app-time-select-column">
        <span className="app-time-select-label">Minuto</span>
        <CustomSelect
          value={minute}
          onValueChange={handleMinuteChange}
          options={minuteOptions}
          size="sm"
          className="w-full"
          buttonClassName="rounded-xl border-slate-700/70 bg-slate-950/55"
          menuClassName="max-h-56"
          ariaLabel="Seleccionar minuto"
        />
      </div>
    </div>
  );
}

export default function DatePickerField({
  label,
  name,
  value,
  onChange,
  onValueChange,
  mode = "date",
  placeholder = "Seleccionar fecha",
  disabled = false,
  accent = "cyan",
  className = "",
}) {
  const isDateTime = mode === "datetime";
  const selected = isDateTime
    ? parseLocalDateTime(value)
    : parseLocalDate(value);

  const handleDateChange = (date) => {
    const nextValue = date
      ? isDateTime
        ? formatLocalDateTime(date)
        : formatLocalDate(date)
      : "";

    onChange?.({ target: { name, value: nextValue } });
    onValueChange?.(nextValue, date);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-sm text-slate-300 mb-2">{label}</label>}
      <DatePicker
        selected={selected}
        onChange={handleDateChange}
        showTimeInput={isDateTime}
        customTimeInput={isDateTime ? <TimeInput /> : undefined}
        timeFormat="HH:mm"
        timeInputLabel=""
        dateFormat={isDateTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
        locale="es"
        disabled={disabled}
        placeholderText={placeholder}
        autoComplete="off"
        wrapperClassName="w-full"
        popperClassName="app-datepicker-popper"
        calendarClassName="app-datepicker-calendar"
        showPopperArrow={false}
        shouldCloseOnSelect={!isDateTime}
        customInput={<DateInput placeholder={placeholder} accent={accent} />}
      />
    </div>
  );
}
