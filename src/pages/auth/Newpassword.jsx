import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import { changePassword } from "../../api/auth.api";
import ChangePasswordForm from "../../components/NewPassword/ChangePasswordForm";

const NewPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modal, setModal] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const email = params.get("email");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && !email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const handleChangePassword = async () => {
    try {
      const res = await changePassword(email, password);
      setModal({
        show: true,
        message: res.message || "Contraseña cambiada correctamente",
        type: "success",
      });

      setTimeout(() => {
        const token = localStorage.getItem("token");
        if (token) {
          navigate("/");
        } else {
          navigate("/login");
        }
      }, 2500);
    } catch (error) {
      setModal({
        show: true,
        message: "Error al cambiar contraseña",
        type: "error",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-center text-gray-100">
          Crear nueva contraseña
        </h2>

        <p className="text-sm text-gray-400 text-center">
          Para proteger tu cuenta, escoge una contraseña de más de 6 caracteres.
        </p>

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
      </div>

      <ConfirmationModal
        show={modal.show}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, show: false })}
      />
    </div>
  );
};

export default NewPassword;
