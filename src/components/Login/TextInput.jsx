const TextInput = ({ name, value, onChange, placeholder, isInvalid }) => {
  return (
    <label className="ui-field">
      <span className="ui-label">Correo electrónico</span>
      <div className="auth-input-shell" data-invalid={isInvalid || undefined}>
      <input
        type="email"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="email"
        aria-label="Correo electrónico"
        aria-invalid={isInvalid || undefined}
        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
      />
      </div>
    </label>
  );
};

export default TextInput;
