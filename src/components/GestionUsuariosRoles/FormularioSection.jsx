import FormularioUsuario from "../../components/GestionUsuariosRoles/FormularioUsuario";
import Buscador from "../../components/GestionUsuariosRoles/Buscador";

export default function FormularioSection({
  busqueda,
  setBusqueda,
  nuevoUsuario,
  handleChange,
  handleSubmit,
  formularioValido,
}) {
  return (
    <>
      <FormularioUsuario
        nuevoUsuario={nuevoUsuario}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        formularioValido={formularioValido}
      />
      <Buscador busqueda={busqueda} setBusqueda={setBusqueda} />
    </>
  );
}
