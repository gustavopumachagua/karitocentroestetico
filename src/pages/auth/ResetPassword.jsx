import axios from "axios";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import ResetHeader from "../../components/ResetPassword/ResetHeader";
import ResetForm from "../../components/ResetPassword/ResetForm";
import ResetSuccess from "../../components/ResetPassword/ResetSuccess";
import ErrorAlert from "../../components/ResetPassword/ErrorAlert";
import { FaEnvelopeOpenText, FaLock, FaShieldAlt } from "react-icons/fa";

export default function ResetPassword() {
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const userFromStorage = JSON.parse(localStorage.getItem("user"));

  const [email, setEmail] = useState(
    emailFromState || userFromStorage?.email || ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (value) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Ingresa un correo válido (ej: usuario@dominio.com)");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {
          email,
        }
      );
      setSuccess(true);
    } catch (err) {
      console.error("Error al enviar correo:", err);
      setError(
        err.response?.data?.message ||
          "Ocurrió un error al enviar el correo. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) return <ResetSuccess email={email} />;

  return (
    <section className="auth-screen">
      <div className="auth-grid">
        <div className="auth-visual">
          <div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-300/12 text-cyan-200">
              <FaEnvelopeOpenText />
            </div>
            <p className="text-sm font-semibold uppercase text-cyan-200">
              Recuperación de acceso
            </p>
            <h1 className="mt-3 max-w-lg text-4xl font-black leading-tight text-white">
              Recupera tu contraseña sin perder el ritmo del trabajo.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
              Te enviaremos un enlace seguro al correo asociado a tu cuenta para
              que puedas crear una nueva contraseña.
            </p>
          </div>

          <div className="mt-8 grid gap-3">
            <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-300/12 text-cyan-200">
                <FaShieldAlt />
              </div>
              <div>
                <p className="font-semibold text-white">Enlace seguro</p>
                <p className="mt-1 text-sm leading-5 text-slate-400">
                  El cambio se confirma desde tu correo registrado.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-300/12 text-cyan-200">
                <FaLock />
              </div>
              <div>
                <p className="font-semibold text-white">Cuenta protegida</p>
                <p className="mt-1 text-sm leading-5 text-slate-400">
                  Si no solicitaste el cambio, ignora el correo recibido.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <ResetHeader />
          {error && <ErrorAlert message={error} />}
          <ResetForm
            email={email}
            setEmail={setEmail}
            validateEmail={validateEmail}
            loading={loading}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </section>
  );
}
