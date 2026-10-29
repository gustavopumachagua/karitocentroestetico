export default function ClienteCard({ cliente, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ui-card ui-card-interactive group flex min-w-0 w-full flex-col gap-5 text-left"
    >
      <span className="flex min-w-0 w-full flex-col gap-1">
        <span className="text-base font-semibold leading-relaxed text-slate-100 break-words">{cliente.nombre}</span>
        <span className="text-sm text-slate-400">{cliente.sexo}</span>
        {cliente.celular && (
          <span className="text-sm text-slate-400 tabular-nums">Cel. {cliente.celular}</span>
        )}
      </span>
      <span className="mt-auto flex w-full flex-wrap items-end justify-between gap-3 border-t border-slate-700/60 pt-4">
        <span className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Total invertido</span>
          <span className="text-lg font-medium tabular-nums text-slate-100">S/ {cliente.totalInvertido.toFixed(2)}</span>
        </span>
        <span className="text-xs text-slate-400">{cliente.tratamientos.length} atenciones registradas</span>
      </span>
    </button>
  );
}
