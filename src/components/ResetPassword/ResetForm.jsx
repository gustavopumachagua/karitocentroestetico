import { FaEnvelope } from "react-icons/fa";

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
          className={`absolute top-3.5 left-3 transition ${
            isEmailInvalid ? "text-red-500" : "text-gray-500"
          }`}
        />
        <input
          type="text"
          name="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full pl-10 pr-3 py-2.5 bg-gray-800 text-gray-100 border rounded-lg outline-none transition
            ${
              isEmailInvalid
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
            }`}
        />
      </div>

      <button
        type="submit"
        disabled={!isFormValid || loading}
        className={`w-full py-2.5 font-semibold text-white rounded-lg shadow-md transition active:scale-95
          ${
            !isFormValid || loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
          }`}
      >
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
