import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/Login/LoginForm";

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

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
    <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-gray-100">
          Acceder
        </h2>

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
  );
}
