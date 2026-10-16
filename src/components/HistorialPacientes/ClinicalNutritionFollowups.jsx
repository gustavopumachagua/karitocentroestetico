import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaClipboardList, FaUtensils } from "react-icons/fa";
import { useNutritionFollowups } from "../../hooks/useNutritionFollowups";
import Paginacion from "./Paginacion";

const FOLLOWUPS_PER_PAGE = 3;
const STATUS_LABELS = { sin_plan: "Plan pendiente", borrador: "Borrador guardado", finalizado: "Plan finalizado" };
const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
const dateLabel = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Fecha no disponible" : date.toLocaleDateString("es-PE", { timeZone: "America/Lima", day: "2-digit", month: "long", year: "numeric" });
};

export default function ClinicalNutritionFollowups({ selectedId, onSelect, search = "", socket }) {
  const { entries, loading, error, refresh } = useNutritionFollowups(socket);
  const navigate = useNavigate();
  const [paginaActual, setPaginaActual] = useState(1);
  const normalizedSearch = normalize(search);
  const filteredEntries = entries.filter((entry) => normalize(entry.paciente?.nombre).includes(normalizedSearch));
  const totalPaginas = Math.ceil(filteredEntries.length / FOLLOWUPS_PER_PAGE);
  // Clamp during rendering too: a refresh must never leave an empty page
  // while the state catches up with a shorter authorized result set.
  const paginaVisible = Math.min(paginaActual, Math.max(1, totalPaginas));
  const firstIndex = (paginaVisible - 1) * FOLLOWUPS_PER_PAGE;
  const visibleEntries = filteredEntries.slice(firstIndex, firstIndex + FOLLOWUPS_PER_PAGE);
  const selected = selectedId ? entries.find((entry) => entry.id === selectedId) : null;
  const openPlan = (entry) => navigate(`/cosmiatra/historial-de-clientes/plan?historia=${encodeURIComponent(entry.id)}`);

  useEffect(() => { setPaginaActual(1); }, [search]);
  useEffect(() => {
    setPaginaActual((current) => Math.min(current, Math.max(1, totalPaginas)));
  }, [totalPaginas]);

  return (
    <section className="ui-panel space-y-5" aria-label="Seguimientos alimentarios">
      <header className="ui-toolbar">
        <div className="min-w-0">
          <p className="ui-eyebrow">Seguimiento alimentario</p>
          <h2 className="text-xl font-semibold text-slate-100">{selected ? selected.paciente.nombre : "Historias derivadas para plan alimentario"}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">Ficha de seguimiento creada al finalizar la historia clínica. No incluye atenciones previas ni documentos privados del doctor.</p>
        </div>
        {selectedId && <button type="button" onClick={() => onSelect("")} className="ui-button ui-button-secondary"><FaArrowLeft /> Volver al listado</button>}
      </header>
      {error && <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-rose-300"><span>{error}</span><button type="button" onClick={() => void refresh()} className="ui-button ui-button-secondary">Reintentar</button></div>}
      {loading && !entries.length && <p role="status" className="text-sm text-slate-400">Cargando seguimientos…</p>}
      {selected ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[ ["Sexo", selected.paciente.sexo], ["Edad", selected.indicadores.edad ? `${selected.indicadores.edad} años` : ""], ["Peso", selected.indicadores.peso ? `${selected.indicadores.peso} kg` : ""], ["Talla", selected.indicadores.talla ? `${selected.indicadores.talla} m` : ""], ["IMC", selected.indicadores.imc], ["Celular", selected.paciente.celular], ["Historia finalizada", dateLabel(selected.fechaFinalizacion)], ["Estado del plan", STATUS_LABELS[selected.planEstado] || "Plan pendiente"] ].map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-xl border border-slate-700 bg-slate-950/30 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 break-words font-medium text-slate-100">{value || "No registrado"}</p></div>
            ))}
          </div>
          <button type="button" onClick={() => openPlan(selected)} className="ui-button ui-button-primary"><FaUtensils />{selected.planEstado === "finalizado" ? "Ver plan alimentario" : selected.planEstado === "borrador" ? "Continuar plan" : "Generar plan"}</button>
        </div>
      ) : !loading && selectedId ? (
        <p role="status" className="text-sm text-slate-400">Este seguimiento no está disponible para tu cuenta o fue asignado a otro profesional.</p>
      ) : !loading && !entries.length ? (
        <p className="ui-empty-state text-sm">Los nuevos seguimientos aparecerán aquí al finalizar una historia clínica. Tus atenciones de Cosmiatra se conservan debajo.</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleEntries.map((entry) => (
              <button type="button" key={entry.id} onClick={() => onSelect(entry.id)} className="ui-card ui-card-interactive min-w-0 space-y-3 text-left focus-visible:outline-indigo-300">
                <span className="flex items-start gap-3"><FaClipboardList className="mt-1 shrink-0 text-indigo-300" /><span className="min-w-0 break-words font-semibold text-slate-100">{entry.paciente.nombre}</span></span>
                <span className="block text-xs text-slate-400">Finalizada el {dateLabel(entry.fechaFinalizacion)}</span>
                <span className="ui-status">{STATUS_LABELS[entry.planEstado] || "Plan pendiente"}</span>
                <span className="block text-sm font-medium text-indigo-300">Abrir seguimiento →</span>
              </button>
            ))}
            {!loading && entries.length > 0 && !filteredEntries.length && <p className="text-sm text-slate-400">No hay seguimientos que coincidan con la búsqueda.</p>}
          </div>
          {totalPaginas > 1 && (
            <nav aria-label="Paginación de seguimientos alimentarios">
              <p className="text-center text-xs text-slate-400">Mostrando {firstIndex + 1}–{Math.min(firstIndex + FOLLOWUPS_PER_PAGE, filteredEntries.length)} de {filteredEntries.length} seguimientos</p>
              <Paginacion paginaActual={paginaVisible} totalPaginas={totalPaginas} cambiarPagina={(page) => setPaginaActual(Math.max(1, Math.min(page, totalPaginas)))} />
            </nav>
          )}
        </div>
      )}
    </section>
  );
}
