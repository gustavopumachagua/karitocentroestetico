import { useState } from "react";
import { FaExclamationTriangle, FaSignOutAlt } from "react-icons/fa";
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
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-500/12 py-2.5 font-semibold text-red-100 shadow transition hover:bg-red-500/20"
      >
        <FaSignOutAlt className="text-lg" />
        <span className="truncate">Cerrar sesión</span>
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="dark-surface w-full max-w-sm rounded-lg p-6 text-center animate-fade-in">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/12 text-red-200">
                <FaExclamationTriangle />
              </div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                ¿Estás seguro?
              </h2>
              <p className="mb-6 text-slate-400">
                Si cierras sesión tendrás que volver a iniciar con tus
                credenciales.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-slate-200 shadow transition hover:bg-white/[0.06]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-lg bg-red-600 py-2 font-semibold text-white shadow transition hover:bg-red-500"
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
