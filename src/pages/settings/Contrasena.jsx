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
      <div className="page-stack account-settings">
          <div className="ui-page-header mb-0">
            <div>
            <p className="ui-eyebrow">Seguridad de la cuenta</p>
            <h1 className="ui-title mt-2">Cambiar contraseña</h1>
            </div>
          </div>
        <div className="ui-panel account-section">
          <div className="account-section-copy">
            <h2>Contraseña de acceso</h2>
            <p>Restablece la contraseña asociada a tu cuenta.</p>
          </div>
          <div className="min-w-0 space-y-6">
          <p className="ui-description mt-0 text-sm">
            Cambiar tu contraseña cerrará tu sesión en otros dispositivos.
            Tendrás que introducir en ellos tu nueva contraseña para acceder de
            nuevo a tu cuenta.
          </p>

          <button
            type="button"
            onClick={handleResetPassword}
            className="ui-button ui-button-primary flex min-h-11 w-full items-center justify-center gap-2 sm:w-auto"
          >
            Restablecer contraseña
          </button>

          <p className="ui-description account-password-note text-sm">
            ¿Tienes problemas? Ponte en contacto con nosotros en{" "}
            <span className="text-indigo-300">
              Soporte al cliente
            </span>
            .
          </p>
          </div>
        </div>
      </div>
    </section>
  );
}
