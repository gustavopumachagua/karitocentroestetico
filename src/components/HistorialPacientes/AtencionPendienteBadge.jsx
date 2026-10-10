import { isPendingTreatmentRecord } from "../../utils/attentionHistory";

export default function AtencionPendienteBadge({ record, className = "" }) {
  if (!isPendingTreatmentRecord(record)) return null;
  return (
    <span className={`inline-flex rounded-lg border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-200 ${className}`}>
      Atención sin tratamiento registrado
    </span>
  );
}
