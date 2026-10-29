import { useState } from "react";
import { FaExclamationTriangle, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { clearAuthSession } from "../../services/authStorage";
import { clearSensitivePwaCaches } from "../../utils/pwaCache";
import { clearClinicalHistoryLocalData } from "../../utils/clinicalHistoryStorage";

export default function LogoutButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearClinicalHistoryLocalData();
    clearAuthSession();
    void clearSensitivePwaCaches();
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="ui-button ui-button-ghost min-h-11 w-full"
      >
        <FaSignOutAlt className="text-sm" aria-hidden="true" />
        <span className="truncate">Cerrar sesión</span>
      </button>

      {isOpen &&
        createPortal(
          <div className="ui-modal-backdrop z-[9999]">
            <div role="dialog" aria-modal="true" aria-labelledby="logout-title" className="ui-modal w-full max-w-sm p-5 sm:p-6">
              <div className="mb-4 text-xl text-amber-200">
                <FaExclamationTriangle aria-hidden="true" />
              </div>
              <h2 id="logout-title" className="mb-2 text-lg font-semibold text-white">
                Cerrar sesión
              </h2>
              <p className="mb-6 text-sm leading-6 text-slate-400">
                Si cierras sesión tendrás que volver a iniciar con tus
                credenciales.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setIsOpen(false)}
                  className="ui-button ui-button-secondary min-h-11 flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="ui-button ui-button-danger min-h-11 flex-1"
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
