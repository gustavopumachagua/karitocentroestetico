import { FaEnvelope, FaPaperPlane } from "react-icons/fa";

export default function ResetForm({
  email,
  setEmail,
  validateEmail,
  loading,
  onSubmit,
}) {
  const isEmailInvalid = email.length > 0 && !validateEmail(email);
  const isFormValid = validateEmail(email);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div
        className={`flex min-h-12 items-stretch overflow-hidden rounded-xl border bg-slate-950/40 transition-colors focus-within:ring-2 ${
          isEmailInvalid
            ? "border-rose-400/70 focus-within:border-rose-300 focus-within:ring-rose-400/25"
            : "border-slate-700 hover:border-slate-500 focus-within:border-indigo-300 focus-within:ring-indigo-300/20"
        }`}
      >
        <span
          aria-hidden="true"
          className={`flex w-11 shrink-0 items-center justify-center border-r transition-colors ${
            isEmailInvalid
              ? "border-rose-400/25 text-rose-300"
              : "border-slate-700 text-slate-400"
          }`}
        >
          <FaEnvelope />
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Correo electrónico"
          aria-invalid={isEmailInvalid || undefined}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
        />
      </div>

      <button
        type="submit"
        disabled={!isFormValid || loading}
        className={`ui-button w-full min-h-12
          ${
            !isFormValid || loading
              ? "ui-button-secondary cursor-not-allowed"
              : "ui-button-primary"
          }`}
      >
        <FaPaperPlane />
        {loading ? "Enviando..." : "Enviar enlace"}
        {!loading}
      </button>
    </form>
  );
}
