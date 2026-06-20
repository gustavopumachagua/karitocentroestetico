import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import { changePassword } from "../../api/auth.api";
import ChangePasswordForm from "../../components/NewPassword/ChangePasswordForm";
import logo from "../../assets/Logo.jpg";
import { FaLock, FaShieldAlt } from "react-icons/fa";

const NewPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modal, setModal] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const resetToken = params.get("token");

  useEffect(() => {
    if (!resetToken) {
      navigate("/login");
    }
  }, [navigate, resetToken]);

  const handleChangePassword = async () => {
    try {
      const res = await changePassword(resetToken, password);
      setModal({
        show: true,
        message: res.message || "Contraseña cambiada correctamente",
        type: "success",
      });

      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }, 2500);
    } catch (error) {
      setModal({
        show: true,
        message:
          error.response?.data?.message || "Error al cambiar contraseña",
        type: "error",
      });
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
              Nueva credencial
            </p>
            <h1 className="mt-3 max-w-lg text-4xl font-black leading-tight text-white">
              Crea una contraseña más segura para tu cuenta.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
              Usa una clave fácil de recordar para ti, pero difícil de adivinar
              para cualquier otra persona.
            </p>
          </div>

          <div className="mt-8 grid gap-3">
            <div className="flex gap-3 rounded-xl p-4"
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
                <FaLock className="text-cyan-300" />
              </div>
              <div>
                <p className="font-semibold text-white">Mínimo recomendado</p>
                <p className="mt-1 text-sm leading-5 text-slate-400">
                  Utiliza al menos 6 caracteres y evita espacios.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl p-4"
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
                <FaShieldAlt className="text-cyan-300" />
              </div>
              <div>
                <p className="font-semibold text-white">Confirmación</p>
                <p className="mt-1 text-sm leading-5 text-slate-400">
                  Repite tu contraseña para evitar errores al guardarla.
                </p>
              </div>
            </div>
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
              Seguridad
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Crear nueva contraseña
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Para proteger tu cuenta, escoge una contraseña de mínimo 6
              caracteres.
            </p>
          </div>

          <ChangePasswordForm
            password={password}
            confirmPassword={confirmPassword}
            setPassword={setPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            onSubmit={handleChangePassword}
          />
        </div>
      </div>

      <ConfirmationModal
        show={modal.show}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, show: false })}
      />
    </section>
  );
};

export default NewPassword;
