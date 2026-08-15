import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/Login/LoginForm";
import AuthPageLayout from "../../components/common/AuthPageLayout";
import { isValidEmail } from "../../utils/validators";
import {
  FaCalendarCheck,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";

const AUTH_HIGHLIGHTS = [
  {
    icon: <FaShieldAlt />,
    title: "Roles protegidos",
    text: "Acceso separado para administración, doctor y cosmiatra.",
  },
  {
    icon: <FaCalendarCheck />,
    title: "Gestión diaria",
    text: "Citas, tratamientos y pagos reunidos en un solo panel.",
  },
  {
    icon: <FaChartLine />,
    title: "Reportes claros",
    text: "Indicadores para revisar operación e ingresos con rapidez.",
  },
];

const ROLE_ROUTES = {
  administrador: "/administrador",
  doctor: "/doctor",
  cosmiatra: "/cosmiatra",
};

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ general: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ general: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.message || "Error en login" });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);

      const rol = data.user.rol?.toLowerCase();
      navigate(ROLE_ROUTES[rol] || "/");
    } catch (error) {
      console.error("Error en login:", error);
      setErrors({ general: "Error de conexión con el servidor" });
    }
  };

  return (
    <AuthPageLayout
      subtitle="Panel privado"
      title="Control interno para el equipo de Karito Centro Estético."
      description="Ingresa para gestionar la operación diaria con una experiencia oscura, ordenada y optimizada para escritorio y móvil."
      highlights={AUTH_HIGHLIGHTS}
      cardSubtitle="Acceso seguro"
      cardTitle="Ingresar"
      cardDescription="Usa tus credenciales del sistema para continuar."
    >
      <LoginForm
        form={form}
        errors={errors}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onChange={handleChange}
        onSubmit={handleSubmit}
        validateEmail={isValidEmail}
      />
    </AuthPageLayout>
  );
}
