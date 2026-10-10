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
        <div className="flex items-center gap-3 rounded-lg bg-slate-950/50 border border-slate-700 px-3 py-2.5">
          <FaIdBadge className="text-cyan-300/80" />
          <span className="text-slate-100 font-medium tracking-widest">
            {cmp}
          </span>
          <button
            type="button"
            onClick={handleEdit}
            className="ml-auto p-1.5 rounded-lg border border-slate-600 bg-slate-800/80 hover:bg-slate-700 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 transition active:scale-95 cursor-pointer"
            title="Editar CMP"
          >
            <FaPen size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        CMP (Colegio Médico del Perú)
      </label>
      <div
        className={`flex items-center rounded-lg px-3 py-2 border transition ${
          error
            ? "bg-slate-950/50 border-rose-400"
            : "bg-slate-950/50 border-slate-700 focus-within:border-cyan-400/60"
        }`}
      >
        <FaIdBadge
          className={`mr-3 ${error ? "text-rose-300" : "text-cyan-300/80"}`}
        />
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={value}
          onChange={handleChange}
          placeholder="000000"
          className="w-full bg-transparent outline-none text-slate-100 placeholder:text-slate-600 tracking-widest text-lg"
        />
        <span className="ml-2 text-xs text-slate-500 whitespace-nowrap">
          {value.length}/6
        </span>
      </div>

      {error && (
        <p className="text-sm text-rose-300 animate-fadeIn">{error}</p>
      )}

      <div className="flex gap-3 justify-end pt-1">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition active:scale-95 cursor-pointer text-sm"
        >
          <FaTimes className="inline mr-1.5" size={12} />
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleAccept}
          disabled={!isComplete || isSaving}
          className={`px-4 py-2 rounded-lg font-semibold shadow-md transition active:scale-95 text-sm ${
            !isComplete || isSaving
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white cursor-pointer"
          }`}
        >
          <FaCheck className="inline mr-1.5" size={12} />
          {isSaving ? "Guardando..." : "Aceptar"}
        </button>
      </div>
    </div>
  );
}
