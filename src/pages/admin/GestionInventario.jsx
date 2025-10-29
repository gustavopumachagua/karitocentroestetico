import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  getInventario,
  agregarItem,
  eliminarItem,
  actualizarItem,
} from "../../api/inventario.api";
import EditarItemModal from "../../components/GestionInventario/EditarItemModal";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import DeleteConfirmationModal from "../../components/GestionUsuariosRoles/DeleteConfirmationModal";

import InventarioHeader from "../../components/GestionInventario/InventarioHeader";
import AgregarItemForm from "../../components/GestionInventario/AgregarItemForm";
import TablaInsumos from "../../components/GestionInventario/TablaInsumos";
import TablaServicios from "../../components/GestionInventario/TablaServicios";
import Paginacion from "../../components/HistorialPacientes/Paginacion";

export default function GestionInventario() {
  const roles = ["Cosmiatra", "Doctor"];
  const [rolSeleccionado, setRolSeleccionado] = useState("Cosmiatra");
  const [inventario, setInventario] = useState([]);
  const [nuevo, setNuevo] = useState({
    tipo: "insumo",
    nombre: "",
    umbral: "",
    stock: "",
  });
  const [token] = useState(localStorage.getItem("token"));

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("info");
  const [sugerencias, setSugerencias] = useState([]);
  const [indexSeleccionado, setIndexSeleccionado] = useState(-1);
  const [paginaInsumos, setPaginaInsumos] = useState(1);
  const [paginaServicios, setPaginaServicios] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  const handleEditar = (item) => {
    setItemEditando(item);
    setShowEditModal(true);
  };

  const handleGuardarEdicion = async (form) => {
    try {
      const { message, item } = await actualizarItem(
        itemEditando._id,
        form,
        token
      );
      setInventario((prev) => prev.map((i) => (i._id === item._id ? item : i)));
      setModalMessage(message);
      setModalType("success");
      setShowEditModal(false);
      setShowModal(true);
    } catch {
      setModalMessage("Error al actualizar el ítem");
      setModalType("error");
      setShowModal(true);
    }
  };
  const itemsPorPagina = 10;

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const data = await getInventario(rolSeleccionado.toLowerCase(), token);
        setInventario(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInventario();
  }, [rolSeleccionado]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL);

    socket.on("connect", () => {});

    socket.on("inventarioActualizado", (nuevoInventario) => {
      const filtrado = nuevoInventario.filter(
        (i) => i.rol === rolSeleccionado.toLowerCase()
      );
      setInventario(filtrado);
    });

    socket.on("disconnect", () => {});

    return () => socket.disconnect();
  }, [rolSeleccionado]);

  const nombreValido = /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ().,/-]+$/.test(
    nuevo.nombre.trim()
  );

  const existente = inventario.find(
    (item) =>
      item.tipo === nuevo.tipo &&
      item.nombre.toLowerCase() === nuevo.nombre.toLowerCase()
  );

  const stockExistente = existente ? existente.stock : 0;

  const handleStockChange = (e) =>
    /^\d*$/.test(e.target.value) &&
    setNuevo({ ...nuevo, stock: e.target.value });
  const handleUmbralChange = (e) =>
    /^\d*$/.test(e.target.value) &&
    setNuevo({ ...nuevo, umbral: e.target.value });

  const handleNombreChange = (e) => {
    const value = e.target.value;
    setNuevo({ ...nuevo, nombre: value });
    if (value.trim()) {
      const resultados = inventario
        .filter(
          (item) =>
            item.tipo === nuevo.tipo &&
            item.nombre.toLowerCase().includes(value.toLowerCase())
        )
        .map((item) => item.nombre);
      setSugerencias(resultados);
    } else setSugerencias([]);
  };

  const handleSeleccionSugerencia = (nombre) => {
    setNuevo({ ...nuevo, nombre });
    setSugerencias([]);
  };

  const handleKeyDown = (e) => {
    if (sugerencias.length === 0) return;
    if (e.key === "ArrowDown")
      setIndexSeleccionado((prev) =>
        prev < sugerencias.length - 1 ? prev + 1 : 0
      );
    else if (e.key === "ArrowUp")
      setIndexSeleccionado((prev) =>
        prev > 0 ? prev - 1 : sugerencias.length - 1
      );
    else if (e.key === "Enter" && indexSeleccionado >= 0) {
      e.preventDefault();
      handleSeleccionSugerencia(sugerencias[indexSeleccionado]);
    }
  };

  const handleAgregar = async () => {
    if (!nuevo.nombre.trim() || !nombreValido) return;
    if (
      nuevo.tipo === "insumo" &&
      (nuevo.stock === "" || nuevo.umbral === "")
    ) {
      setModalMessage("Debe ingresar stock y umbral para el insumo");
      setModalType("error");
      setShowModal(true);
      return;
    }

    try {
      const { message, item } = await agregarItem(
        {
          rol: rolSeleccionado.toLowerCase(),
          tipo: nuevo.tipo,
          nombre: nuevo.nombre,
          umbral: nuevo.tipo === "insumo" ? Number(nuevo.umbral) : undefined,
          stock: nuevo.tipo === "insumo" ? Number(nuevo.stock) : undefined,
        },
        token
      );

      setModalMessage(message);
      setModalType("success");
      setShowModal(true);

      setInventario((prev) => {
        const existente = prev.find((i) => i._id === item._id);
        return existente
          ? prev.map((i) => (i._id === item._id ? item : i))
          : [...prev, item];
      });

      setNuevo({ tipo: "insumo", nombre: "", umbral: "", stock: "" });
      setSugerencias([]);
    } catch (err) {
      console.error(err);
      setModalMessage("Error al agregar el ítem");
      setModalType("error");
      setShowModal(true);
    }
  };

  const handleEliminar = async () => {
    try {
      await eliminarItem(selectedItem._id, token);
      setInventario((prev) => prev.filter((i) => i._id !== selectedItem._id));
      setModalMessage("Ítem eliminado correctamente");
      setModalType("success");
      setShowDeleteModal(false);
      setShowModal(true);
    } catch {
      setModalMessage("Error al eliminar");
      setModalType("error");
      setShowModal(true);
    }
  };

  const insumos = inventario.filter((i) => i.tipo === "insumo");
  const servicios = inventario.filter((i) => i.tipo === "servicio");
  const totalPaginasInsumos = Math.ceil(insumos.length / itemsPorPagina);
  const totalPaginasServicios = Math.ceil(servicios.length / itemsPorPagina);
  const insumosPaginados = insumos.slice(
    (paginaInsumos - 1) * itemsPorPagina,
    paginaInsumos * itemsPorPagina
  );

  const serviciosPaginados = servicios.slice(
    (paginaServicios - 1) * itemsPorPagina,
    paginaServicios * itemsPorPagina
  );

  return (
    <section className="p-6 sm:p-10 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
        <InventarioHeader
          roles={roles}
          rolSeleccionado={rolSeleccionado}
          setRolSeleccionado={setRolSeleccionado}
        />

        <AgregarItemForm
          nuevo={nuevo}
          setNuevo={setNuevo}
          sugerencias={sugerencias}
          indexSeleccionado={indexSeleccionado}
          handleNombreChange={handleNombreChange}
          handleKeyDown={handleKeyDown}
          handleSeleccionSugerencia={handleSeleccionSugerencia}
          handleStockChange={handleStockChange}
          handleUmbralChange={handleUmbralChange}
          handleAgregar={handleAgregar}
          nombreValido={nombreValido}
          stockExistente={stockExistente}
        />

        {nuevo.tipo === "insumo" && (
          <>
            <TablaInsumos
              insumos={insumosPaginados}
              rolSeleccionado={rolSeleccionado}
              onEliminar={(item) => {
                setSelectedItem(item);
                setShowDeleteModal(true);
              }}
              onEditar={handleEditar}
            />
            {insumos.length > itemsPorPagina && (
              <Paginacion
                paginaActual={paginaInsumos}
                totalPaginas={totalPaginasInsumos}
                cambiarPagina={setPaginaInsumos}
              />
            )}
          </>
        )}

        {nuevo.tipo === "servicio" && (
          <>
            <TablaServicios
              servicios={serviciosPaginados}
              rolSeleccionado={rolSeleccionado}
              onEliminar={(item) => {
                setSelectedItem(item);
                setShowDeleteModal(true);
              }}
              onEditar={handleEditar}
            />
            {servicios.length > itemsPorPagina && (
              <Paginacion
                paginaActual={paginaServicios}
                totalPaginas={totalPaginasServicios}
                cambiarPagina={setPaginaServicios}
              />
            )}
          </>
        )}
      </div>

      <DeleteConfirmationModal
        show={showDeleteModal}
        userName={selectedItem?.nombre}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleEliminar}
      />
      <EditarItemModal
        show={showEditModal}
        item={itemEditando}
        onClose={() => setShowEditModal(false)}
        onSave={handleGuardarEdicion}
      />
      <ConfirmationModal
        show={showModal}
        message={modalMessage}
        type={modalType}
        onClose={() => setShowModal(false)}
      />
    </section>
  );
}
