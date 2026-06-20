import FechaCita from "../TablaCitas/FechaCita";

export default function FechaField({ fecha }) {
  return (
    <div>
      <label className="block text-slate-300 text-sm mb-2">Fecha</label>
      <div
        className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-slate-100"
      >
        <FechaCita fecha={fecha} />
      </div>
    </div>
  );
}
