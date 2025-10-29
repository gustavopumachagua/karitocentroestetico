import { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

export default function LogoutButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition cursor-pointer shadow"
      >
        <FaSignOutAlt className="text-lg" />
        <span className="truncate">Cerrar sesión</span>
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] px-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                ¿Estás seguro?
              </h2>
              <p className="text-gray-600 mb-6">
                Si cierras sesión tendrás que volver a iniciar con tus
                credenciales.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer shadow"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition cursor-pointer shadow"
                >
                  Sí, cerrar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
