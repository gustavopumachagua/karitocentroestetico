import { forwardRef, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import { FaCalendarAlt } from "react-icons/fa";
import CustomSelect from "./CustomSelect";

registerLocale("es", es);

const accentStyles = {
  cyan: {
    focus: "focus:border-indigo-300 focus:ring-indigo-400/20",
    icon: "text-indigo-300",
  },
  emerald: {
    focus: "focus:border-indigo-300 focus:ring-indigo-400/20",
    icon: "text-indigo-300",
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
    <div className="relative min-w-0 w-full">
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
        className={`ui-control min-h-11 w-full py-2.5 pl-11 pr-4 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${styles.focus} ${className}`}
      />
    </div>
  );
});

function TimeInput({ value = "", onChange, onTimeSelectionComplete }) {
  const [rawHour = "00", rawMinute = "00"] = value.split(":");
  const hour = rawHour || "00";
  const minute = rawMinute || "00";

  const handleHourChange = (nextHour) => {
    onChange(`${nextHour}:${minute}`);
  };

  const handleMinuteChange = (nextMinute) => {
    onChange(`${hour}:${nextMinute}`);
    onTimeSelectionComplete?.();
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
          className="min-w-0 w-full"
          buttonClassName="min-h-11 rounded-xl border-slate-700 bg-slate-950/55"
          menuClassName="max-h-56"
          ariaLabel="Seleccionar hora"
          preventParentOutsideClick
        />
      </div>
      <div className="app-time-select-column">
        <span className="app-time-select-label">Minuto</span>
        <CustomSelect
          value={minute}
          onValueChange={handleMinuteChange}
          options={minuteOptions}
          size="sm"
          className="min-w-0 w-full"
          buttonClassName="min-h-11 rounded-xl border-slate-700 bg-slate-950/55"
          menuClassName="max-h-56"
          ariaLabel="Seleccionar minuto"
          preventParentOutsideClick
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
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);
  const selected = isDateTime
    ? parseLocalDateTime(value)
    : parseLocalDate(value);

  const openDateTimePicker = () => setIsDateTimePickerOpen(true);
  const closeDateTimePicker = () => setIsDateTimePickerOpen(false);

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
    <div className={`ui-field min-w-0 flex flex-col ${className}`}>
      {label && <label className="ui-label mb-2">{label}</label>}
      <DatePicker
        selected={selected}
        onChange={handleDateChange}
        showTimeInput={isDateTime}
        customTimeInput={
          isDateTime ? (
            <TimeInput onTimeSelectionComplete={closeDateTimePicker} />
          ) : undefined
        }
        timeFormat="HH:mm"
        timeInputLabel=""
        dateFormat={isDateTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
        locale="es"
        disabled={disabled}
        placeholderText={placeholder}
        autoComplete="off"
        wrapperClassName="min-w-0 w-full"
        popperClassName="app-datepicker-popper"
        calendarClassName="app-datepicker-calendar"
        showPopperArrow={false}
        shouldCloseOnSelect={!isDateTime}
        open={isDateTime ? isDateTimePickerOpen : undefined}
        onInputClick={isDateTime ? openDateTimePicker : undefined}
        onClickOutside={isDateTime ? closeDateTimePicker : undefined}
        onCalendarClose={isDateTime ? closeDateTimePicker : undefined}
        customInput={<DateInput placeholder={placeholder} accent={accent} />}
      />
    </div>
  );
}
