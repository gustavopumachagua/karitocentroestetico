import { useEffect, useState } from "react";
import axios from "axios";
import BuscadorClientes from "../../components/GestionClientes/BuscadorClientes";
import ClienteCard from "../../components/GestionClientes/ClienteCard";
import ClienteDetalle from "../../components/GestionClientes/ClienteDetalle";
import Paginacion from "../../components/HistorialPacientes/Paginacion";
import { FaUser } from "react-icons/fa";

export default function GestionClientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const clientesPorPagina = 9;
  const API_TRATAMIENTOS = `${import.meta.env.VITE_API_URL}/tratamientos`;
  const API_PAGOS = `${import.meta.env.VITE_API_URL}/pagos`;
  const API_BUSCAR = `${import.meta.env.VITE_API_URL}/citas/buscar`;

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    try {
      const token = localStorage.getItem("token");
      const [resTrat, resPagos] = await Promise.all([
        axios.get(API_TRATAMIENTOS, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(API_PAGOS, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const mapa = {};
      resTrat.data.forEach((t) => {
        if (!mapa[t.nombre]) {
          mapa[t.nombre] = {
            nombre: t.nombre,
            edad: t.edad,
            sexo: t.sexo || "No especificado",
            tratamientos: [],
            totalInvertido: 0,
          };
        }
        mapa[t.nombre].tratamientos.push(t);
      });

      resPagos.data.forEach((p) => {
        if (mapa[p.cliente]) {
          mapa[p.cliente].totalInvertido += p.total;
        }
      });

      setClientes(Object.values(mapa));
    } catch (err) {
      console.error("Error al obtener datos de clientes:", err);
    }
  };

  const manejarCambioBusqueda = async (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    if (valor.length >= 2) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BUSCAR}?nombre=${valor}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSugerencias(res.data);
      } catch (err) {
        console.error("Error al autocompletar:", err);
      }
    } else {
      setSugerencias([]);
    }
  };

  const manejarSeleccion = (nombre) => {
    setBusqueda(nombre);
    setSugerencias([]);
  };

  const indiceInicial = (paginaActual - 1) * clientesPorPagina;
  const clientesPagina = clientes.slice(
    indiceInicial,
    indiceInicial + clientesPorPagina
  );
  const totalPaginas = Math.ceil(clientes.length / clientesPorPagina);

  return (
    <section className="p-6 sm:p-10 bg-gray-900 min-h-screen text-gray-100">
      <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-6 sm:p-8">
        {!clienteSeleccionado ? (
          <>
            <BuscadorClientes
              busqueda={busqueda}
              manejarCambioBusqueda={manejarCambioBusqueda}
              sugerencias={sugerencias}
              manejarSeleccion={manejarSeleccion}
            />

            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaUser className="text-indigo-400" /> Clientes Registrados
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientesPagina
                .filter((c) =>
                  c.nombre.toLowerCase().includes(busqueda.toLowerCase())
                )
                .map((cliente, idx) => (
                  <ClienteCard
                    key={idx}
                    cliente={cliente}
                    onClick={() => setClienteSeleccionado(cliente)}
                  />
                ))}
            </div>

            {totalPaginas > 1 && (
              <div className="flex justify-center">
                <Paginacion
                  paginaActual={paginaActual}
                  totalPaginas={totalPaginas}
                  cambiarPagina={setPaginaActual}
                />
              </div>
            )}
          </>
        ) : (
          <ClienteDetalle
            cliente={clienteSeleccionado}
            volver={() => setClienteSeleccionado(null)}
          />
        )}
      </div>
    </section>
  );
}
