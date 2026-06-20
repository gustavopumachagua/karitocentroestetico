import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/Login/LoginForm";
import logo from "../../assets/Logo.jpg";
import {
  FaCalendarCheck,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";

const authHighlights = [
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

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ general: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

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

      if (rol === "administrador") navigate("/administrador");
      else if (rol === "doctor") navigate("/doctor");
      else if (rol === "cosmiatra") navigate("/cosmiatra");
      else navigate("/");
    } catch (error) {
      console.error("Error en login:", error);
      setErrors({ general: "Error de conexión con el servidor" });
    }
  };

  return (
    <section className="auth-screen">
      <div className="auth-grid">
        <div className="auth-visual">
          <div>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl overflow-hidden"
              style={{
                background: 'rgba(34, 211, 238, 0.08)',
                border: '1px solid rgba(34, 211, 238, 0.15)',
              }}
            >
              <img src={logo} alt="Karito" className="h-12 w-12 rounded-lg object-cover" />
            </div>
            <p className="text-sm font-semibold uppercase text-cyan-200">
              Panel privado
            </p>
            <h1 className="mt-3 max-w-lg text-4xl font-black leading-tight text-white">
              Control interno para el equipo de Karito Centro Estético.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
              Ingresa para gestionar la operación diaria con una experiencia
              oscura, ordenada y optimizada para escritorio y móvil.
            </p>
          </div>

          <div className="mt-8 grid gap-3">
            {authHighlights.map((item) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.02]"
                style={{
                  border: '1px solid rgba(148, 163, 184, 0.08)',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: 'rgba(34, 211, 238, 0.08)',
                    border: '1px solid rgba(34, 211, 238, 0.12)',
                  }}
                >
                  <span className="text-cyan-300">{item.icon}</span>
                </div>
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-400">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-card">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl overflow-hidden"
              style={{
                background: 'rgba(34, 211, 238, 0.08)',
                border: '1px solid rgba(34, 211, 238, 0.15)',
              }}
            >
              <img src={logo} alt="Karito" className="h-12 w-12 rounded-lg object-cover" />
            </div>
            <p className="text-xs font-semibold uppercase text-cyan-200">
              Acceso seguro
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">Ingresar</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Usa tus credenciales del sistema para continuar.
            </p>
          </div>

          <LoginForm
            form={form}
            errors={errors}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onChange={handleChange}
            onSubmit={handleSubmit}
            validateEmail={validateEmail}
          />
        </div>
      </div>
    </section>
  );
}
