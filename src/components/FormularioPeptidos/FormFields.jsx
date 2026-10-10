import { createContext, useContext, useState } from "react";
import { FORM_TITLE, FORM_SUBTITLE } from "./formConfig";

const FormStepContext = createContext(null);

/**
 * Supplies the current, visible section number to a form step.  A section can
 * be omitted (for example, gyneco-obstetric history for male patients), so
 * hard-coding the Roman number inside every step would leave gaps.
 */
export function FormStepProvider({ section, children }) {
  return (
    <FormStepContext.Provider value={section}>
      {children}
    </FormStepContext.Provider>
  );
}

const CONTROL_CLASS_NAME =
  "ui-control w-full rounded-lg bg-slate-950/50 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-cyan-400/60";

/**
 * Keeps a positive decimal value while the user is typing. Commas are
 * normalized to dots so every numeric field is stored in the same format.
 */
function sanitizeDecimalInput(value) {
  const normalized = String(value ?? "")
    .replace(/,/g, ".")
    .replace(/[^\d.]/g, "");
  const [integerPart, ...decimalParts] = normalized.split(".");

  if (decimalParts.length === 0) return integerPart;

  return `${integerPart || "0"}.${decimalParts.join("")}`;
}

function emitInputValue(onChange, name, value) {
  onChange({ target: { name, value } });
}

/** Header shown at the top of every step */
export function FormHeader({ section, title }) {
  const activeSection = useContext(FormStepContext);

  return (
    <div className="ui-card space-y-1 border-b border-slate-700/50 px-4 py-4 text-center sm:px-6">
      <p className="ui-eyebrow justify-center">Formulario clínico</p>
      <h1 className="text-lg font-bold tracking-wide text-white sm:text-xl">
        {FORM_TITLE}
      </h1>
      <p className="text-xs sm:text-sm text-cyan-300/80 font-medium">
        {FORM_SUBTITLE}
      </p>
      <h2 className="text-base sm:text-lg font-semibold text-white pt-2">
        {activeSection || section}. {title}
      </h2>
    </div>
  );
}

/** Text input field */
export function TextField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
  disabled = false,
  min,
  max,
  className = "",
}) {
  return (
    <div className={`ui-field space-y-1 ${className}`} data-form-field={name}>
      <label className="ui-label block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        required={required}
        className="ui-control w-full rounded-lg bg-slate-950/50 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-cyan-400/60 disabled:opacity-50"
      />
    </div>
  );
}

/** Textarea field */
export function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  rows = 3,
  className = "",
}) {
  return (
    <div className={`ui-field space-y-1 ${className}`} data-form-field={name}>
      <label className="ui-label block text-sm font-medium text-slate-300">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="ui-control w-full resize-none rounded-lg bg-slate-950/50 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-cyan-400/60"
      />
    </div>
  );
}

/** Low-level numeric input used when a custom layout is needed. */
export function NumericInput({
  name,
  value,
  onChange,
  placeholder = "",
  className = "",
  ariaLabel,
}) {
  const handleChange = (e) => {
    emitInputValue(onChange, name, sanitizeDecimalInput(e.target.value));
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      pattern="[0-9]*[.,]?[0-9]*"
      name={name}
      data-form-field={name}
      value={value ?? ""}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={`${CONTROL_CLASS_NAME} ${className}`}
    />
  );
}

/** Numeric input (only digits + an optional decimal separator) */
export function NumericField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  className = "",
}) {
  return (
    <div className={`ui-field space-y-1 ${className}`} data-form-field={name}>
      <label className="ui-label block text-sm font-medium text-slate-300">
        {label}
      </label>
      <NumericInput
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        ariaLabel={label}
      />
    </div>
  );
}

/** DNI field (8 digits only) */
export function DniField({ label, name, value, onChange, className = "" }) {
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    emitInputValue(onChange, name, raw);
  };

  return (
    <div className={`space-y-1 ${className}`} data-form-field={name}>
      <label className="block text-sm font-medium text-slate-300">
        {label} <span className="text-rose-400 ml-1">*</span>
      </label>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        minLength={8}
        maxLength={8}
        required
        name={name}
        value={value}
        onChange={handleChange}
        placeholder="00000000"
        className="ui-control w-full rounded-lg bg-slate-950/50 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-cyan-400/60 tracking-widest"
      />
      <span className="text-xs text-slate-500">{value.length}/8 dígitos</span>
    </div>
  );
}

/** Age field (digits only) */
export function AgeField({
  label,
  name,
  value,
  onChange,
  min = 18,
  max = 130,
  className = "",
}) {
  const [validationMessage, setValidationMessage] = useState("");

  const canBecomeValidAge = (raw) => {
    if (!raw || raw.startsWith("0")) return false;

    const numericValue = Number(raw);
    if (numericValue >= min && numericValue <= max) return true;
    if (raw.length >= 3) return false;

    // A partial value such as "1" or "13" is kept only when it can still
    // become a valid age (18–130) with the next digit. This lets a clinician
    // type 18, 100 or 130 naturally while rejecting 14–17 immediately.
    const remainingDigits = 3 - raw.length;
    return Array.from({ length: remainingDigits }, (_, index) => index + 1).some(
      (digitsToAppend) => {
        const factor = 10 ** digitsToAppend;
        const lowestPossible = numericValue * factor;
        const highestPossible = lowestPossible + factor - 1;

        return highestPossible >= min && lowestPossible <= max;
      },
    );
  };

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 3);
    if (raw && !canBecomeValidAge(raw)) {
      setValidationMessage(`La edad debe estar entre ${min} y ${max} años.`);
      return;
    }

    setValidationMessage("");
    emitInputValue(onChange, name, raw);
  };

  const handleBlur = () => {
    const numericValue = Number(value);
    if (value && (numericValue < min || numericValue > max)) {
      emitInputValue(onChange, name, "");
      setValidationMessage(`La edad debe estar entre ${min} y ${max} años.`);
    }
  };

  const isOutOfRange =
    value && (Number(value) < min || Number(value) > max);
  const message =
    validationMessage ||
    (isOutOfRange ? `La edad debe estar entre ${min} y ${max} años.` : "");

  return (
    <div className={`ui-field space-y-1 ${className}`} data-form-field={name}>
      <label className="ui-label block text-sm font-medium text-slate-300">
        {label} <span className="text-rose-400 ml-1">*</span>
      </label>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        min={min}
        max={max}
        maxLength={3}
        required
        name={name}
        data-form-field={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="años"
        aria-invalid={Boolean(message)}
        aria-describedby={`${name}-age-help`}
        className={`ui-control w-full rounded-lg bg-slate-950/50 border px-3 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-cyan-400/60 ${
          message ? "border-rose-400/80" : "border-slate-700"
        }`}
      />
      <span
        id={`${name}-age-help`}
        className={`text-xs ${message ? "text-rose-300" : "text-slate-500"}`}
        role={message ? "alert" : undefined}
      >
        {message || `Edad mínima: ${min} años`}
      </span>
    </div>
  );
}

/** Radio group (single select) */
export function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  otherName,
  otherValue,
  onOtherChange,
  disabled = false,
  className = "",
}) {
  return (
    <div className={`ui-field space-y-2 ${className}`} data-form-field={name}>
      <label className="ui-label block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label
            key={opt}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
              value === opt
                ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-100"
                : "border-slate-700 bg-slate-950/30 text-slate-300 hover:border-slate-600"
            } ${disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={onChange}
              disabled={disabled}
              className="hidden"
            />
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                value === opt ? "border-cyan-400" : "border-slate-500"
              }`}
            >
              {value === opt && (
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
              )}
            </span>
            {opt}
          </label>
        ))}
      </div>
      {otherName && value === "Otro" && !disabled && (
        <input
          type="text"
          name={otherName}
          value={otherValue}
          onChange={onOtherChange}
          placeholder="Especifique..."
          className="ui-control mt-1 w-full rounded-lg bg-slate-950/50 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-cyan-400/60"
        />
      )}
    </div>
  );
}

/** Checkbox group (multi select) */
export function CheckboxGroup({
  label,
  name,
  options,
  values = [],
  onChange,
  otherName,
  otherValue,
  onOtherChange,
  className = "",
}) {
  const handleToggle = (opt) => {
    const newValues = values.includes(opt)
      ? values.filter((v) => v !== opt)
      : [...values, opt];
    onChange(newValues);
  };

  return (
    <div className={`ui-field space-y-2 ${className}`} data-form-field={name}>
      <label className="ui-label block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label
            key={opt}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
              values.includes(opt)
                ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-100"
                : "border-slate-700 bg-slate-950/30 text-slate-300 hover:border-slate-600"
            }`}
          >
            <input
              type="checkbox"
              name={name}
              checked={values.includes(opt)}
              onChange={() => handleToggle(opt)}
              className="hidden"
            />
            <span
              className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                values.includes(opt) ? "border-cyan-400 bg-cyan-400" : "border-slate-500"
              }`}
            >
              {values.includes(opt) && (
                <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              )}
            </span>
            {opt}
          </label>
        ))}
      </div>
      {otherName && values.includes("Otros") && (
        <input
          type="text"
          name={otherName}
          value={otherValue}
          onChange={onOtherChange}
          placeholder="Especifique..."
          className="ui-control mt-1 w-full rounded-lg bg-slate-950/50 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-cyan-400/60"
        />
      )}
    </div>
  );
}

/** Yes/No radio pair */
export function YesNoField({ label, name, value, onChange, className = "" }) {
  return (
    <div className={`ui-field space-y-1 ${className}`} data-form-field={name}>
      <label className="ui-label block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="flex gap-2">
        {["No", "Sí"].map((opt) => (
          <label
            key={opt}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition text-sm ${
              value === opt
                ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-100"
                : "border-slate-700 bg-slate-950/30 text-slate-300 hover:border-slate-600"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={onChange}
              className="hidden"
            />
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                value === opt ? "border-cyan-400" : "border-slate-500"
              }`}
            >
              {value === opt && (
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
              )}
            </span>
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

/** Navigation buttons */
export function FormNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  isFirst,
  isLast,
  isValid = true,
}) {
  return (
    <div className="ui-toolbar mt-6 flex flex-col gap-4 border-t border-slate-700/50 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">
          Paso {currentStep + 1} de {totalSteps}
        </span>
        {!isValid && (
          <span className="text-xs text-amber-300/80 animate-pulse">
            Complete todos los campos requeridos
          </span>
        )}
      </div>
      <div className="flex gap-3">
        {!isFirst && (
          <button
            type="button"
            onClick={onPrev}
            className="ui-button ui-button-secondary rounded-lg border border-slate-600 bg-slate-800/80 px-5 py-2.5 text-sm font-medium text-slate-200 transition active:scale-95"
          >
            Anterior
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
            className={`ui-button rounded-lg px-5 py-2.5 text-sm font-semibold shadow-md transition active:scale-95 ${
              isValid
              ? "ui-button-primary bg-gradient-to-r from-cyan-600 to-violet-600 text-white hover:from-cyan-500 hover:to-violet-500"
              : "bg-slate-700 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isLast ? "Finalizar" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}

/** Step progress bar */
export function StepProgress({ currentStep, totalSteps, steps }) {
  return (
    <div className="ui-card w-full px-3 py-3 sm:px-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">
          Sección {steps[currentStep].section}
        </span>
        <span className="text-xs text-slate-500">
          {currentStep + 1}/{totalSteps}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
