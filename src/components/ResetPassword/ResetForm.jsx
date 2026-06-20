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
      <div className="relative">
        <FaEnvelope
          className={`absolute left-3 top-3.5 transition ${
            isEmailInvalid ? "text-red-300" : "text-slate-500"
          }`}
        />
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full rounded-lg border bg-slate-950/50 py-3 pl-10 pr-3 text-slate-100 outline-none transition placeholder:text-slate-500
            ${
              isEmailInvalid
                ? "border-red-400/70 focus:border-red-300 focus:ring-2 focus:ring-red-400/30"
                : "border-white/10 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
            }`}
        />
      </div>

      <button
        type="submit"
        disabled={!isFormValid || loading}
        className={`group flex w-full items-center justify-center gap-2 rounded-lg py-3 font-bold shadow-lg transition active:scale-[0.99]
          ${
            !isFormValid || loading
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-cyan-400 text-slate-950 shadow-cyan-950/30 hover:bg-cyan-300"
          }`}
      >
        <FaPaperPlane />
        {loading ? "Enviando..." : "Enviar enlace"}
        {!loading}
      </button>
    </form>
  );
}
