import { NUTRITION_MEALS } from "../../utils/nutritionPlan";
import { NUTRITION_DOCUMENT_STYLE, nutritionIndicatorSummary } from "../../utils/nutritionPlanPresentation";
import "./nutritionPlan.css";

/** Accessible application-owned preview, using the same content model as PDF. */
export default function NutritionPlanDocument({ model }) {
  const colors = Object.fromEntries(
    Object.entries(NUTRITION_DOCUMENT_STYLE.colors).map(([key, value]) => [
      `--nutrition-document-${key}`,
      `rgb(${value.join(" ")})`,
    ]),
  );
  return (
    <article className="nutrition-plan-document" style={colors} aria-label="Vista previa del plan alimentario">
      <header>
        <h2>{model.title}</h2>
        <p className="nutrition-document-patient"><strong>Paciente:</strong> {model.paciente}</p>
        <p className="nutrition-document-indicators">{nutritionIndicatorSummary(model)}</p>
      </header>
      <div className="nutrition-document-table-scroll" tabIndex={0} role="region" aria-label="Menú semanal; desplázate horizontalmente en pantallas pequeñas">
        <table>
          <colgroup>
            {NUTRITION_DOCUMENT_STYLE.columnRatios.map((ratio, index) => (
              <col key={index} style={{ width: `${ratio * 100}%` }} />
            ))}
          </colgroup>
          <thead><tr><th scope="col">Día</th>{NUTRITION_MEALS.map(({ key, label }) => <th key={key} scope="col">{label}</th>)}</tr></thead>
          <tbody>{model.semana.map(({ dia, comidas }) => <tr key={dia}><th scope="row">{dia}</th>{comidas.map(({ key, value }) => <td key={key}>{value || "—"}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <section className="nutrition-document-notes" aria-label="Indicaciones del plan">
        <p><strong>Indicaciones:</strong>{" "}{model.indicaciones || "—"}</p>
      </section>
      <footer><span>{model.brand}</span><span>Documento de uso personal y confidencial</span></footer>
    </article>
  );
}
