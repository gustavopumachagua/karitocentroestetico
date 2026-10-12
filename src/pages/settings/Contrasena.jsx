import { FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Contrasena() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleResetPassword = () => {
    if (!user || !user.email) {
      alert("No se encontró el usuario. Por favor inicia sesión primero.");
      return navigate("/login");
    }

    navigate("/reset-password", { state: { email: user.email } });
  };

  return (
    <section className="page-section ui-page">
      <div className="page-stack page-stack-narrow">
        <div className="ui-panel min-w-0 space-y-6">
          <div>
            <p className="ui-eyebrow">Seguridad de la cuenta</p>
            <h1 className="ui-title mt-2">Cambiar contraseña</h1>
          </div>
          <p className="ui-description text-sm">
            Cambiar tu contraseña cerrará tu sesión en otros dispositivos.
            Tendrás que introducir en ellos tu nueva contraseña para acceder de
            nuevo a tu cuenta.
          </p>

          <button
            type="button"
            onClick={handleResetPassword}
            className="ui-button ui-button-primary flex min-h-11 w-full items-center justify-center gap-2 sm:w-auto"
          >
            <FaLock />
            Restablecer contraseña
          </button>

          <p className="ui-description border-t border-slate-700 pt-5 text-sm">
            ¿Tienes problemas? Ponte en contacto con nosotros en{" "}
            <span className="text-indigo-300">
              Soporte al cliente
            </span>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
