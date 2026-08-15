import { useState } from "react";
import { useLocation } from "react-router-dom";
import AuthPageLayout from "../../components/common/AuthPageLayout";
import ResetForm from "../../components/ResetPassword/ResetForm";
import ResetSuccess from "../../components/ResetPassword/ResetSuccess";
import ErrorAlert from "../../components/ResetPassword/ErrorAlert";
import { resetPassword } from "../../api/auth.api";
import { isValidEmail } from "../../utils/validators";
import { FaLock, FaShieldAlt } from "react-icons/fa";

const HIGHLIGHTS = [
  {
    icon: <FaShieldAlt />,
    title: "Enlace seguro",
    text: "El cambio se confirma desde tu correo registrado.",
  },
  {
    icon: <FaLock />,
    title: "Cuenta protegida",
    text: "Si no solicitaste el cambio, ignora el correo recibido.",
  },
];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Ingresa un correo válido (ej: usuario@dominio.com)");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
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
    <AuthPageLayout
      subtitle="Recuperación de acceso"
      title="Recupera tu contraseña sin perder el ritmo del trabajo."
      description="Te enviaremos un enlace seguro al correo asociado a tu cuenta para que puedas crear una nueva contraseña."
      highlights={HIGHLIGHTS}
      cardSubtitle="Recuperar acceso"
      cardTitle="Restablecer contraseña"
      cardDescription="Ingresa tu correo electrónico registrado y te enviaremos un enlace para crear una nueva contraseña."
    >
      {error && <ErrorAlert message={error} />}
      <ResetForm
        email={email}
        setEmail={setEmail}
        validateEmail={isValidEmail}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </AuthPageLayout>
  );
}
