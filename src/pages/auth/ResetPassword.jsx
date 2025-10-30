import axios from "axios";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ResetHeader from "../../components/ResetPassword/ResetHeader";
import ResetForm from "../../components/ResetPassword/ResetForm";
import ResetSuccess from "../../components/ResetPassword/ResetSuccess";
import ErrorAlert from "../../components/ResetPassword/ErrorAlert";

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

  useEffect(() => {
    if (userFromStorage && !email) {
      setEmail(userFromStorage.email);
    }
  }, [userFromStorage]);

  const validateEmail = (value) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);

  const sendResetRequest = async (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email.includes("noexiste")) {
          reject(new Error("No existe una cuenta con ese correo"));
        } else {
          resolve({ ok: true, msg: "Correo de recuperación enviado" });
        }
      }, 1200);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("❌ Ingresa un correo válido (ej: usuario@dominio.com)");
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
    <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
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
  );
}
