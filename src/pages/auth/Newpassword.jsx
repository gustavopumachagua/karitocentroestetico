import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import { changePassword } from "../../api/auth.api";
import ChangePasswordForm from "../../components/NewPassword/ChangePasswordForm";
import AuthPageLayout from "../../components/common/AuthPageLayout";
import { useModal } from "../../hooks/useModal";
import { FaLock, FaShieldAlt } from "react-icons/fa";

const HIGHLIGHTS = [
  {
    icon: <FaLock />,
    title: "Mínimo recomendado",
    text: "Utiliza al menos 6 caracteres y evita espacios.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Confirmación",
    text: "Repite tu contraseña para evitar errores al guardarla.",
  },
];

const NewPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { modal, setModal, cerrarModal } = useModal();

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
    <>
      <AuthPageLayout
        subtitle="Nueva credencial"
        title="Crea una contraseña más segura para tu cuenta."
        description="Usa una clave fácil de recordar para ti, pero difícil de adivinar para cualquier otra persona."
        highlights={HIGHLIGHTS}
        cardSubtitle="Seguridad"
        cardTitle="Crear nueva contraseña"
        cardDescription="Para proteger tu cuenta, escoge una contraseña de mínimo 6 caracteres."
      >
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
      </AuthPageLayout>

      <ConfirmationModal
        show={modal.show}
        message={modal.message}
        type={modal.type}
        onClose={cerrarModal}
      />
    </>
  );
};

export default NewPassword;
