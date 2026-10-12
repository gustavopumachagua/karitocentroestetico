import { useState } from "react";
import { FaIdBadge, FaPen, FaCheck, FaTimes } from "react-icons/fa";

export default function CmpField({ cmp, onSave, onCancel, isSaving }) {
  const [editing, setEditing] = useState(!cmp);
  const [value, setValue] = useState(cmp || "");
  const [error, setError] = useState("");

  const isComplete = /^\d{6}$/.test(value);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    setValue(raw);
    if (raw.length > 0 && raw.length < 6) {
      setError("El CMP debe tener exactamente 6 dígitos.");
    } else {
      setError("");
    }
  };

  const handleAccept = () => {
    if (!isComplete) return;
    onSave(value);
    setEditing(false);
  };

  const handleCancel = () => {
    if (cmp) {
      setValue(cmp);
      setEditing(false);
    } else {
      setValue("");
    }
    setError("");
    onCancel();
  };

  const handleEdit = () => {
    setEditing(true);
  };

  if (!editing && cmp) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          CMP (Colegio Médico del Perú)
        </label>
        <div className="flex min-h-12 min-w-0 items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2">
          <FaIdBadge className="shrink-0 text-indigo-300" aria-hidden="true" />
          <span className="min-w-0 text-slate-100 font-medium tracking-widest">
            {cmp}
          </span>
          <button
            type="button"
            onClick={handleEdit}
            className="ui-icon-button ml-auto h-11 w-11 shrink-0"
            title="Editar CMP"
            aria-label="Editar CMP"
          >
            <FaPen size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="profile-cmp" className="ui-label block">
        CMP (Colegio Médico del Perú)
      </label>
      <div
        className={`flex min-h-12 min-w-0 items-center rounded-xl border bg-slate-950/40 px-3 py-2 transition-colors focus-within:ring-2 ${
          error
            ? "border-rose-400 focus-within:ring-rose-400/20"
            : "border-slate-700 focus-within:border-indigo-300 focus-within:ring-indigo-300/20"
        }`}
      >
        <FaIdBadge
          className={`mr-3 shrink-0 ${error ? "text-rose-300" : "text-slate-400"}`}
          aria-hidden="true"
        />
        <input
          id="profile-cmp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={value}
          onChange={handleChange}
          placeholder="000000"
          aria-invalid={Boolean(error)}
          className="min-w-0 w-full bg-transparent text-base tracking-widest text-slate-100 outline-none placeholder:text-slate-400"
        />
        <span className="ml-2 text-xs text-slate-400 whitespace-nowrap">
          {value.length}/6
        </span>
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-300">{error}</p>
      )}

      <div className="flex flex-col justify-end gap-3 pt-3 sm:flex-row">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="ui-button ui-button-secondary min-h-11"
        >
          <FaTimes className="inline mr-1.5" size={12} />
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleAccept}
          disabled={!isComplete || isSaving}
          className={`ui-button min-h-11 ${
            !isComplete || isSaving
              ? "ui-button-secondary cursor-not-allowed"
              : "ui-button-primary"
          }`}
        >
          <FaCheck className="inline mr-1.5" size={12} />
          {isSaving ? "Guardando..." : "Aceptar"}
        </button>
      </div>
    </div>
  );
}
