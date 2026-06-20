import { FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Contrasena() {
  const navigate = useNavigate();

  const handleResetPassword = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) {
      alert("No se encontró el usuario. Por favor inicia sesión primero.");
      return navigate("/login");
    }

    navigate("/reset-password", { state: { email: user.email } });
  };

  return (
    <section className="page-section">
      <div className="page-stack page-stack-narrow">
        <div className="page-panel page-panel-pad space-y-6 text-center">
          <h1 className="section-title text-3xl">Cambiar contraseña</h1>
          <p className="section-muted text-sm">
            Cambiar tu contraseña cerrará tu sesión en otros dispositivos.
            Tendrás que introducir en ellos tu nueva contraseña para acceder de
            nuevo a tu cuenta.
          </p>

          <button
            type="button"
            onClick={handleResetPassword}
            className="mx-auto flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-6 py-3 font-semibold text-slate-950 shadow-md shadow-cyan-950/30 transition hover:bg-cyan-300 active:scale-95 sm:w-auto"
          >
            <FaLock />
            Restablecer contraseña
          </button>

          <p className="section-muted pt-4 text-sm">
            ¿Tienes problemas? Ponte en contacto con nosotros en{" "}
            <span className="cursor-pointer text-cyan-200 transition hover:text-cyan-100 hover:underline">
              Soporte al cliente
            </span>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
