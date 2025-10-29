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
    <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700 text-center">
        <h1 className="text-3xl font-bold text-gray-100">Cambiar contraseña</h1>
        <p className="text-gray-400 text-sm">
          Cambiar tu contraseña cerrará tu sesión en otros dispositivos. Tendrás
          que introducir en ellos tu nueva contraseña para acceder de nuevo a tu
          cuenta.
        </p>

        <button
          type="button"
          onClick={handleResetPassword}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 mx-auto shadow-md transition active:scale-95 cursor-pointer"
        >
          <FaLock />
          Restablecer contraseña
        </button>

        <p className="text-gray-400 text-sm pt-4">
          ¿Tienes problemas? Ponte en contacto con nosotros en{" "}
          <span className="text-indigo-400 cursor-pointer hover:text-indigo-300 hover:underline transition">
            Soporte al cliente
          </span>
          .
        </p>
      </div>
    </div>
  );
}
