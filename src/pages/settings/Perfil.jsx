import { useEffect, useRef, useState } from "react";
import AvatarUploader from "../../components/Perfil/AvatarUploader";
import ProfileForm from "../../components/Perfil/ProfileForm";
import CmpField from "../../components/Perfil/CmpField";
import FirmaDigitalField from "../../components/Perfil/FirmaDigitalField";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import { useModal } from "../../hooks/useModal";
import API from "../../api/axiosConfig";

const DEFAULT_AVATAR = "/avatar-default.svg";

export default function Perfil({ user, setUser }) {
  const [avatar, setAvatar] = useState(user?.avatar || DEFAULT_AVATAR);
  const [nombre, setNombre] = useState(user?.nombre || "");
  const previousSavedName = useRef(user?.nombre || "");
  const [cmp, setCmp] = useState(user?.cmp || "");
  const [firmaDigital, setFirmaDigital] = useState(user?.firmaDigital || "");
  const [isSaving, setIsSaving] = useState(false);
  const { modal, setModal, cerrarModal } = useModal();
  const isDoctor = String(user?.rol || "")
    .trim()
    .toLowerCase() === "doctor";
  const updateAuthenticatedUser = (changes) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...changes,
    }));
  };
  const userId = user?.id || user?._id;

  useEffect(() => {
    const currentName = user?.nombre || "";
    const savedName = previousSavedName.current;
    previousSavedName.current = currentName;
    // Refresh the saved profile after a session update while preserving a
    // name the user is currently editing and has not saved yet.
    setNombre((draftName) => draftName === savedName ? currentName : draftName);
  }, [user?.nombre]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data } = await API.put(`/usuarios/${userId}`, { nombre });

      const updatedUser = {
        ...(data?.user || {}),
        nombre: data?.user?.nombre || nombre.trim(),
      };
      setNombre(updatedUser.nombre);
      updateAuthenticatedUser(updatedUser);
      setModal({
        show: true,
        message: "Cambios guardados correctamente.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setModal({
        show: true,
        message: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNombre(user?.nombre || "");
    setAvatar(user?.avatar || DEFAULT_AVATAR);
    setModal({
      show: true,
      message: "Cambios cancelados.",
      type: "error",
    });
  };

  const handleSaveCmp = async (newCmp) => {
    setIsSaving(true);
    try {
      const { data } = await API.put(`/usuarios/${userId}`, {
        // Use the visible profile name rather than a potentially stale route
        // prop when the clinician saved both details in the same visit.
        nombre: nombre.trim(),
        cmp: newCmp,
      });
      const updatedUser = {
        ...(data?.user || {}),
        nombre: data?.user?.nombre || nombre.trim(),
        cmp: data?.user?.cmp ?? newCmp,
      };
      setNombre(updatedUser.nombre);
      setCmp(updatedUser.cmp || "");
      updateAuthenticatedUser(updatedUser);
      setModal({
        show: true,
        message: "CMP guardado correctamente.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setModal({
        show: true,
        message: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelCmp = () => {
    // No-op or reset
  };

  const handleSaveFirma = async (url) => {
    setIsSaving(true);
    try {
      // El endpoint de carga ya persiste la firma junto con su publicId.
      // Aquí solo sincronizamos el estado autenticado del frontend.
      setFirmaDigital(url);
      updateAuthenticatedUser({ firmaDigital: url });
      setModal({
        show: true,
        message: "Firma digital guardada correctamente.",
        type: "success",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelFirma = () => {
    // No-op or reset
  };

  return (
    <section className="page-section ui-page">
      <div className="page-stack page-stack-narrow">
        <div className="ui-panel min-w-0 space-y-6">
          <div>
            <p className="ui-eyebrow">Configuración de cuenta</p>
            <h1 className="ui-title mt-2">Editar perfil</h1>
            <p className="ui-description mt-2 text-sm">
              Actualiza tu nombre, foto y datos visibles dentro del sistema.
            </p>
          </div>

          <div className="ui-card flex min-w-0 flex-col items-center py-6 text-center">
            <AvatarUploader
              avatar={avatar}
              setAvatar={(url) => {
                setAvatar(url);
                updateAuthenticatedUser({ avatar: url });
              }}
              userId={userId}
            />
            <p className="mt-3 max-w-full break-words text-lg font-semibold text-slate-100">{nombre}</p>
            <p className="text-sm text-slate-400">{user?.rol || "Rol"}</p>
          </div>

          <ProfileForm
            nombre={nombre}
            setNombre={setNombre}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        </div>

        {isDoctor && (
          <>
            <div className="ui-panel min-w-0 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Registro CMP</h2>
                <p className="ui-description mt-1 text-sm">
                  Número de colegiatura del Colegio Médico del Perú.
                </p>
              </div>
              <CmpField
                cmp={cmp}
                onSave={handleSaveCmp}
                onCancel={handleCancelCmp}
                isSaving={isSaving}
              />
            </div>

            <div className="ui-panel min-w-0 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Firma Digital</h2>
                <p className="ui-description mt-1 text-sm">
                  Sube una imagen de tu firma para los documentos clínicos.
                </p>
              </div>
              <FirmaDigitalField
                userId={userId}
                firmaDigital={firmaDigital}
                onSave={handleSaveFirma}
                onCancel={handleCancelFirma}
                isSaving={isSaving}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmationModal
        show={modal.show}
        message={modal.message}
        type={modal.type}
        onClose={() => cerrarModal()}
      />
    </section>
  );
}
