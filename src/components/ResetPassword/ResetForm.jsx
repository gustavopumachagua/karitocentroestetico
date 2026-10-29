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
      <label className="ui-field">
        <span className="ui-label">Correo electrónico</span>
        <div className="auth-input-shell" data-invalid={isEmailInvalid || undefined}>
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
      </label>

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
        {loading ? "Enviando..." : "Enviar enlace"}
        {!loading}
      </button>
    </form>
  );
}
