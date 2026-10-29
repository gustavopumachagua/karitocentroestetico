import { useCallback, useEffect, useMemo, useState } from "react";
import { buscarCitas } from "../../api/citas.api";
import { getHistorialAtenciones } from "../../api/tratamientos.api";
import { getPagos } from "../../api/pagos.api";
import BuscadorClientes from "../../components/GestionClientes/BuscadorClientes";
import ClienteCard from "../../components/GestionClientes/ClienteCard";
import ClienteDetalle from "../../components/GestionClientes/ClienteDetalle";
import Paginacion from "../../components/HistorialPacientes/Paginacion";
import ExportarExcelButton from "../../components/GestionClientes/ExportarExcelButton";
import { CardGridSkeleton } from "../../components/common/SkeletonLayouts";
import { useProfessionalDirectory } from "../../hooks/useProfessionalDirectory";
import { useCitas } from "../../hooks/useCitas";
import { usePatientUpdates } from "../../hooks/usePatientUpdates";
import { getPatientId, getPatientKey, isSamePatient } from "../../utils/patientIdentity";

export default function GestionClientes() {
  const { professionalNamesById } = useProfessionalDirectory();
  const { socket } = useCitas();
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

  const clientesPorPagina = 9;

  const obtenerClientes = useCallback(async () => {
    try {
      setLoading(true);
      const [tratData, pagosData] = await Promise.all([
        getHistorialAtenciones(),
        getPagos(),
      ]);

      const mapa = new Map();
      tratData.forEach((t) => {
        const patientKey = getPatientKey(t);
        if (!mapa.has(patientKey)) {
          mapa.set(patientKey, {
            pacienteId: getPatientId(t) || undefined,
            patientKey,
            nombre: t.nombre,
            sexo: t.sexo || "No especificado",
            celular: t.celular || "",
            tratamientos: [],
            totalInvertido: 0,
          });
        }

        const cliente = mapa.get(patientKey);
        if (t.sexo && cliente.sexo === "No especificado") cliente.sexo = t.sexo;
        if (t.celular && !cliente.celular) cliente.celular = t.celular;
        cliente.tratamientos.push(t);
      });

      pagosData.forEach((p) => {
        const candidates = mapa.has(getPatientKey(p))
          ? [mapa.get(getPatientKey(p))]
          : [...mapa.values()].filter((cliente) =>
              cliente.tratamientos.some((tratamiento) => isSamePatient(tratamiento, p)),
            );
        const cliente = candidates.length === 1 ? candidates[0] : null;
        if (cliente) {
          cliente.totalInvertido += Number(p.total || 0);
        }
      });

      const clientesActualizados = [...mapa.values()];
      setClientes(clientesActualizados);
      setClienteSeleccionado((current) =>
        current
          ? clientesActualizados.find((cliente) => isSamePatient(cliente, current)) || current
          : null,
      );
    } catch (err) {
      console.error("Error al obtener datos de clientes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void obtenerClientes();
  }, [obtenerClientes]);

  useEffect(() => {
    if (!socket) return undefined;
    const refresh = () => { void obtenerClientes(); };
    const events = ["nuevaCita", "estadoCitaActualizado", "citaActualizada", "tratamientoActualizado", "nuevoPago"];
    events.forEach((event) => socket.on(event, refresh));
    return () => events.forEach((event) => socket.off(event, refresh));
  }, [socket, obtenerClientes]);

  usePatientUpdates((patient) => {
    if (patient?.nombreAnterior && patient?.nombre) {
      setBusqueda((current) =>
        current.trim().toLocaleLowerCase("es-PE") === patient.nombreAnterior.trim().toLocaleLowerCase("es-PE")
          ? patient.nombre
          : current,
      );
    }
    setSugerencias([]);
    void obtenerClientes();
  }, socket);

  const manejarCambioBusqueda = async (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    setPaginaActual(1);

    if (valor.length >= 2) {
      try {
        const data = await buscarCitas(valor);
        setSugerencias(data);
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
    setPaginaActual(1);
  };

  const clientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es-PE");

    if (!termino) {
      return clientes;
    }

    return clientes.filter((cliente) =>
      cliente.nombre.toLocaleLowerCase("es-PE").includes(termino),
    );
  }, [busqueda, clientes]);

  const indiceInicial = (paginaActual - 1) * clientesPorPagina;
  const clientesPagina = clientesFiltrados.slice(
    indiceInicial,
    indiceInicial + clientesPorPagina,
  );
  const totalPaginas = Math.ceil(
    clientesFiltrados.length / clientesPorPagina,
  );

  return (
    <section className="page-section ui-page">
      <div className="page-stack">
        {!clienteSeleccionado ? (
          <>
            <div className="ui-panel flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <BuscadorClientes
                  busqueda={busqueda}
                  manejarCambioBusqueda={manejarCambioBusqueda}
                  sugerencias={sugerencias}
                  manejarSeleccion={manejarSeleccion}
                />
              </div>
              <div className="shrink-0">
                <ExportarExcelButton />
              </div>
            </div>

            {loading ? (
              <CardGridSkeleton count={9} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
                {clientesPagina.map((cliente) => (
                  <ClienteCard
                    key={cliente.patientKey}
                    cliente={cliente}
                    onClick={() => setClienteSeleccionado(cliente)}
                  />
                ))}
              </div>
            )}

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
            professionalNamesById={professionalNamesById}
          />
        )}
      </div>
    </section>
  );
}
