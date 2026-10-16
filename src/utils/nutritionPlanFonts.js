import normalFontUrl from "../assets/fonts/DejaVuSans.ttf?url";
import boldFontUrl from "../assets/fonts/DejaVuSans-Bold.ttf?url";

let pendingFonts;

const base64Font = async (url) => {
  const response = await fetch(url, { credentials: "omit", redirect: "error", cache: "force-cache" });
  if (!response.ok) throw new Error("No se pudieron cargar las fuentes del PDF. Revisa tu conexión e inténtalo nuevamente.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length < 100 || bytes.length > 2_000_000 || bytes[0] !== 0 || bytes[1] !== 1 || bytes[2] !== 0 || bytes[3] !== 0) {
    throw new Error("La fuente del PDF no está disponible. Recarga la aplicación e inténtalo nuevamente.");
  }
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 16384) binary += String.fromCharCode(...bytes.subarray(offset, offset + 16384));
  return btoa(binary);
};

/** Local licensed fonts only: no third-party font provider or credentials. */
export function loadNutritionPdfFonts() {
  if (!pendingFonts) pendingFonts = Promise.all([base64Font(normalFontUrl), base64Font(boldFontUrl)])
    .then(([normal, bold]) => ({ normal, bold }))
    .catch((error) => { pendingFonts = undefined; throw error; });
  return pendingFonts;
}

export function installNutritionPdfFonts(doc, fonts) {
  doc.addFileToVFS("DejaVuSans.ttf", fonts.normal);
  doc.addFont("DejaVuSans.ttf", "NutritionSans", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", fonts.bold);
  doc.addFont("DejaVuSans-Bold.ttf", "NutritionSans", "bold");
}

/** Fail before finalization rather than silently dropping an unsupported glyph. */
export function assertNutritionPdfGlyphs(doc, model) {
  const values = [model.brand, model.title, model.paciente, model.sexo,
    ...model.indicadores.flatMap(({ label, value }) => [label, value]),
    ...model.semana.flatMap(({ dia, comidas }) => [dia, ...comidas.flatMap(({ label, value }) => [label, value])]),
    "Indicaciones", model.indicaciones];
  for (const style of ["normal", "bold"]) {
    doc.setFont("NutritionSans", style);
    const font = doc.getFont().metadata;
    for (const value of values) for (const character of String(value || "")) {
      const code = character.codePointAt(0);
      if ([" ", "\r", "\n", "\t"].includes(character)) continue;
      if (code > 0xFFFF || !font.characterToGlyph(code)) {
        const error = new Error(`El PDF no admite el carácter «${character}» (U+${code.toString(16).toUpperCase()}). Sustitúyelo por texto antes de finalizar el plan; no se ha eliminado contenido.`);
        error.code = "NUTRITION_UNSUPPORTED_GLYPH";
        throw error;
      }
    }
  }
}
