import { useState, useMemo } from "react";
import {
  FaArrowLeft,
  FaUser,
  FaMale,
  FaFemale,
  FaVenusMars,
  FaMoneyBillWave,
  FaClinicMedical,
  FaPhoneAlt,
} from "react-icons/fa";
import TratamientoCard from "./TratamientoCard";
import Paginacion from "../HistorialPacientes/Paginacion";

export default function ClienteDetalle({ cliente, volver }) {
  const tratamientosPorPagina = 9;
  const [paginaActual, setPaginaActual] = useState(1);

  const IconoUsuario =
    cliente.sexo?.toLowerCase() === "masculino"
      ? FaMale
      : cliente.sexo?.toLowerCase() === "femenino"
      ? FaFemale
      : FaUser;

  const totalPaginas = Math.ceil(
    cliente.tratamientos.length / tratamientosPorPagina
  );

  const tratamientosVisibles = useMemo(() => {
    const inicio = (paginaActual - 1) * tratamientosPorPagina;
    const fin = inicio + tratamientosPorPagina;
    return cliente.tratamientos.slice(inicio, fin);
  }, [paginaActual, cliente.tratamientos]);

  return (
    <div>
      <button
        onClick={volver}
        className="flex items-center gap-2 mb-8 text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
      >
        <FaArrowLeft /> Volver
      </button>

      <div className="bg-gray-700 rounded-2xl p-6 border border-gray-600 shadow-lg">
        <h2 className="text-3xl font-bold mb-2 text-white flex items-center gap-2">
          <IconoUsuario className="text-indigo-400" /> {cliente.nombre}
        </h2>

        <p className="text-gray-300 flex items-center gap-2 mb-1">
          <FaVenusMars className="text-pink-400" /> Sexo: {cliente.sexo}
        </p>

        {cliente.celular && (
          <p className="text-gray-300 flex items-center gap-2 mb-1">
            <FaPhoneAlt className="text-blue-400" /> Celular: {cliente.celular}
          </p>
        )}

        <p className="text-gray-300 flex items-center gap-2 mb-4">
          <FaMoneyBillWave className="text-green-400" /> Total invertido:{" "}
          <span className="text-indigo-400 font-semibold">
            S/ {cliente.totalInvertido.toFixed(2)}
          </span>
        </p>

        <h3 className="text-xl font-semibold text-indigo-400 mb-3 flex items-center gap-2">
          <FaClinicMedical /> Historial de tratamientos
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tratamientosVisibles.map((t, idx) => (
            <TratamientoCard key={idx} tratamiento={t} />
          ))}
        </div>

        {cliente.tratamientos.length > tratamientosPorPagina && (
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            cambiarPagina={setPaginaActual}
          />
        )}
      </div>
    </div>
  );
}
