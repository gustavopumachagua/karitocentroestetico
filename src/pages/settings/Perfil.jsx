import { useState } from "react";
import AvatarUploader from "../../components/Perfil/AvatarUploader";
import ProfileForm from "../../components/Perfil/ProfileForm";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";

export default function Perfil({ user, setUser }) {
  const [avatar, setAvatar] = useState(
    user?.avatar ||
      "https://res.cloudinary.com/db8tsilie/image/upload/v1759552820/avatar_ilbvur.jpg"
  );
  const [nombre, setNombre] = useState(user?.nombre || "");
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState({ show: false, message: "" });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/usuarios/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nombre, avatar }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar perfil");
      }

      setUser(data.user);
      setModal({
        show: true,
        message: "Cambios guardados correctamente.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setModal({
        show: true,
        message: err.message,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNombre(user?.nombre || "");
    setAvatar(
      user?.avatar ||
        "https://res.cloudinary.com/db8tsilie/image/upload/v1759552820/avatar_ilbvur.jpg"
    );
    setModal({
      show: true,
      message: "Cambios cancelados.",
      type: "error",
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-3xl p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold text-gray-100 text-center">
          Editar perfil
        </h1>
        <p className="text-gray-400 text-sm text-center">
          Aquí puedes actualizar tu nombre, foto, email y otros datos
          personales.
        </p>

        <div className="flex flex-col items-center">
          <AvatarUploader avatar={avatar} setAvatar={setAvatar} />
          <p className="mt-3 text-lg font-semibold text-white">{nombre}</p>
          <p className="text-sm text-gray-400">{user?.rol || "Rol"}</p>
        </div>

        <ProfileForm
          nombre={nombre}
          setNombre={setNombre}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      </div>

      <ConfirmationModal
        show={modal.show}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ show: false, message: "", type: "info" })}
      />
    </div>
  );
}
