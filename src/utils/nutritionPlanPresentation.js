/** Shared document proportions and palette, independent of editor/theme. */
export const NUTRITION_DOCUMENT_STYLE = Object.freeze({
  margin: 10,
  fontSize: 9,
  lineHeight: 3.8,
  cellPadding: 1.5,
  headerHeight: 8,
  columnRatios: Object.freeze([0.061, 0.195, 0.147, 0.244, 0.157, 0.196]),
  colors: Object.freeze({
    // A slightly deeper sage keeps small white column titles readable.
    header: Object.freeze([91, 125, 110]),
    day: Object.freeze([237, 242, 239]),
    grid: Object.freeze([191, 198, 194]),
    text: Object.freeze([23, 32, 27]),
    muted: Object.freeze([85, 99, 91]),
  }),
});

/** Same compact patient indicators in the application preview and PDF. */
export function nutritionIndicatorSummary(model) {
  const value = (key) => String(model.indicadores?.find((item) => item.key === key)?.value ?? "").trim() || "—";
  const demographics = [model.sexo, `${value("edad")} años`].filter(Boolean).join(", ");
  return [demographics, `${value("peso")} kg`, `${value("talla")} m`, `IMC ${value("imc")}`].join(" · ");
}
