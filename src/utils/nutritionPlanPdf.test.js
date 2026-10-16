import assert from "node:assert/strict";
import { createRequire, Module } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createNutritionDraft, NUTRITION_MEALS, nutritionDocumentModel } from "./nutritionPlan.js";
import { NUTRITION_DOCUMENT_STYLE, nutritionIndicatorSummary } from "./nutritionPlanPresentation.js";

const require = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const pdfPath = fileURLToPath(new URL("./nutritionPlanPdf.js", import.meta.url));
const previewPath = fileURLToPath(new URL("../components/PlanAlimentario/NutritionPlanDocument.jsx", import.meta.url));
const fonts = {
  normal: (await readFile(new URL("../assets/fonts/DejaVuSans.ttf", import.meta.url))).toString("base64"),
  bold: (await readFile(new URL("../assets/fonts/DejaVuSans-Bold.ttf", import.meta.url))).toString("base64"),
};
const bundle = await build({
  absWorkingDir: projectRoot,
  stdin: { contents: `export * from ${JSON.stringify(pdfPath)};export {default as Preview} from ${JSON.stringify(previewPath)};export {documents} from "__trace__";`, resolveDir: projectRoot },
  bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic", external: ["react", "react/jsx-runtime"],
  plugins: [{ name: "real-pdf-layout-trace", setup(builder) {
    builder.onResolve({ filter: /\.ttf\?url$/ }, () => ({ path: "font-url", namespace: "font-url" }));
    builder.onLoad({ filter: /.*/, namespace: "font-url" }, () => ({ contents: 'export default "/local-test-font.ttf";' }));
    builder.onResolve({ filter: /^__actual_jspdf__$/ }, () => ({ path: require.resolve("jspdf"), external: true }));
    builder.onResolve({ filter: /\.css$/ }, () => ({ path: "css", namespace: "empty-css" }));
    builder.onLoad({ filter: /.*/, namespace: "empty-css" }, () => ({ contents: "" }));
    builder.onResolve({ filter: /^(jspdf|__trace__)$/ }, () => ({ path: "trace", namespace: "trace" }));
    builder.onLoad({ filter: /.*/, namespace: "trace" }, () => ({ contents: `
      import { jsPDF as Actual } from "__actual_jspdf__";
      export const documents = [];
      export function jsPDF(options) {
        const doc = new Actual(options);
        const traced = {doc, options, texts: [], lines: [], rectangles: []};
        documents.push(traced);
        const drawText = doc.text;
        doc.text = function(value, x, y, settings) {
          const content = Array.isArray(value) ? value : [value];
          const lh = doc.getFontSize() / doc.internal.scaleFactor * (settings?.lineHeightFactor ?? doc.getLineHeightFactor());
          traced.texts.push(...content.map((s, i) => ({ text: String(s), x, y: y + i * lh, width: doc.getTextWidth(String(s)), fontSize: doc.getFontSize(), fontStyle: doc.getFont().fontStyle, color: doc.getTextColor(), align: settings?.align || "left", page: doc.internal.getCurrentPageInfo().pageNumber })));
          return drawText.apply(doc, arguments);
        };
        const drawLine = doc.line;
        doc.line = function(x1, y1, x2, y2) { traced.lines.push({x1,y1,x2,y2,page:doc.internal.getCurrentPageInfo().pageNumber});return drawLine.apply(doc,arguments); };
        const drawRect = doc.rect;
        doc.rect = function(x, y, width, height, style) { traced.rectangles.push({x,y,width,height,style,fill:doc.getFillColor(),stroke:doc.getDrawColor(),lineWidth:doc.getLineWidth(),page:doc.internal.getCurrentPageInfo().pageNumber});return drawRect.apply(doc,arguments); };
        return doc;
      }` }));
  } }],
});
const moduleFilename = path.join(projectRoot, "__nutrition_pdf_regression__.cjs");
const compiled = new Module(moduleFilename);
compiled.filename = moduleFilename;
compiled.paths = Module._nodeModulePaths(projectRoot);
compiled._compile(bundle.outputFiles[0].text, moduleFilename);
const { createNutritionPlanPdf, validateNutritionPdfModel, Preview, documents } = compiled.exports;

const model = (long = false) => {
  const seguimiento = { paciente: { nombre: "Paciente de demostración", sexo: "Femenino" }, indicadores: { edad: 30, peso: 75.5, talla: 1.65, imc: 27.7 } };
  const draft = createNutritionDraft(seguimiento);
  draft.semana.forEach((row, index) => NUTRITION_MEALS.forEach(({ key }) => {
    row[key] = `${row.dia} ${key}: ${long ? "Contenido individual con porciones y preparación. ".repeat(36) : `Registro individual ${index + 1}.`}`;
  }));
  draft.indicaciones = long ? "Indicaciones individuales, seguimiento y observaciones del profesional. ".repeat(75) : "Indicaciones del profesional para este paciente.";
  return nutritionDocumentModel(seguimiento, draft);
};
const assertBounds = (capture) => {
  const { margin } = NUTRITION_DOCUMENT_STYLE;
  const width = capture.doc.internal.pageSize.getWidth();
  const height = capture.doc.internal.pageSize.getHeight();
  for (const row of capture.texts) {
    const left = row.align === "right" ? row.x - row.width : row.align === "center" ? row.x - row.width / 2 : row.x;
    assert.ok(left >= margin - 0.1, `left clipping: ${row.text}`);
    assert.ok(left + row.width <= width - margin + 0.2, `right clipping: ${row.text}`);
    assert.ok(row.y >= margin - 0.1, `top clipping: ${row.text}`);
    assert.ok(row.y <= height - 6.9, `bottom clipping: ${row.text} (${row.y})`);
    if (row.fontSize > 6.5) assert.ok(row.y <= height - 15.9, `content touches footer: ${row.text}`);
  }
  for (const rectangle of capture.rectangles) {
    assert.ok(rectangle.x >= margin - 0.01);
    assert.ok(rectangle.x + rectangle.width <= width - margin + 0.01);
    assert.ok(rectangle.y >= margin);
    assert.ok(rectangle.y + rectangle.height <= height - 15.99);
  }
};

// jsPDF serializes RGB channels to two decimals before returning their hex.
const matchesColor = (actual, rgb) => rgb.every((component, index) => Math.abs(Number.parseInt(actual.slice(1 + index * 2, 3 + index * 2), 16) - component) <= 1);
const compact = (value) => value.replace(/\s/gu, "");
const mealColumnX = (doc, mealIndex) => {
  const { margin, columnRatios, cellPadding } = NUTRITION_DOCUMENT_STYLE;
  const preceding = columnRatios.slice(0, mealIndex + 1).reduce((total, ratio) => total + ratio, 0);
  return margin + (doc.internal.pageSize.getWidth() - margin * 2) * preceding + cellPadding;
};
const assertAllMealsPreserved = (capture, documentModel) => {
  NUTRITION_MEALS.forEach((meal, index) => {
    const x = mealColumnX(capture.doc, index);
    const rendered = capture.texts.filter((row) => row.fontSize === 9 && row.align === "left" && Math.abs(row.x - x) < 0.001).map(({ text }) => text).join("");
    const original = documentModel.semana.map((row) => row.comidas[index].value).join("");
    assert.equal(compact(rendered), compact(original), `${meal.label} lost content during pagination`);
  });
};

test("real A4 landscape vector PDF is downloadable and contains seven ordered days", async () => {
  const doc = await createNutritionPlanPdf(model(), fonts);
  const capture = documents.at(-1);
  assert.equal(capture.options.orientation, "landscape");
  assert.equal(capture.options.format, "a4");
  assert.equal(doc.getNumberOfPages(), 1);
  const blob = doc.output("blob");
  assert.equal(await blob.slice(0, 5).text(), "%PDF-");
  assert.ok(blob.size > 1000);
  const days = capture.texts.filter(({ text, fontSize }) => fontSize === 8 && ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].includes(text)).map(({ text }) => text);
  assert.deepEqual(days, model().semana.map(({ dia }) => dia));
  assertAllMealsPreserved(capture, model());
  assertBounds(capture);
});

test("reference design centers the heading and uses a sage six-column grid with pale day cells", async () => {
  const data = model();
  const doc = await createNutritionPlanPdf(data, fonts);
  const capture = documents.at(-1);
  const { margin, headerHeight, columnRatios, colors } = NUTRITION_DOCUMENT_STYLE;
  const width = doc.internal.pageSize.getWidth();
  const title = capture.texts.find(({ text }) => text === data.title.toLocaleUpperCase("es"));
  assert.equal(title.align, "center");
  assert.equal(title.x, width / 2);
  assert.equal(title.fontSize, 18);
  for (const text of [`Paciente: ${data.paciente}`, nutritionIndicatorSummary(data)]) {
    const row = capture.texts.find((entry) => entry.text === text);
    assert.equal(row.align, "center");
    assert.equal(row.x, width / 2);
  }
  const tableHeaders = capture.rectangles.filter(({ fill }) => matchesColor(fill, colors.header));
  assert.equal(tableHeaders.length, 6);
  let nextX = margin;
  tableHeaders.forEach((cell, index) => {
    assert.ok(Math.abs(cell.x - nextX) < 0.001);
    assert.ok(Math.abs(cell.width - (width - margin * 2) * columnRatios[index]) < 0.001);
    assert.equal(cell.height, headerHeight);
    nextX += cell.width;
  });
  for (const label of ["DÍA", ...NUTRITION_MEALS.map(({ label }) => label.toLocaleUpperCase("es"))]) {
    const row = capture.texts.find(({ text }) => text === label);
    assert.equal(row.align, "center");
    assert.equal(row.color, "#ffffff");
    assert.equal(row.fontStyle, "bold");
  }
  assert.equal(capture.rectangles.filter(({ fill }) => matchesColor(fill, colors.day)).length, 7);
  assert.equal(capture.rectangles.filter(({ fill }) => fill === "#ffffff").length, 35);
  for (const rectangle of capture.rectangles) {
    assert.ok(matchesColor(rectangle.stroke, colors.grid));
    assert.equal(rectangle.lineWidth, 0.15);
    assert.equal(rectangle.style, "FD");
  }
  const wednesday = capture.texts.find(({ text }) => text === "Miércoles");
  assert.equal(wednesday.fontSize, 8, "Long day names remain on one line without shrinking meal text");
  const brand = capture.texts.find(({ text }) => text === data.brand);
  assert.ok(brand.y > doc.internal.pageSize.getHeight() - 10, "Brand stays discreet in the footer");
  assertBounds(capture);
});

test("a reference-sized weekly plan and its notes remain legible together on one landscape page", async () => {
  const data = model();
  data.semana.forEach((row) => row.comidas.forEach((meal) => {
    meal.value = `${row.dia}: preparación individual registrada por el profesional, con detalle de porciones.`;
    assert.ok(meal.value.length >= 60 && meal.value.length <= 100);
  }));
  data.indicaciones = "Observaciones del profesional, respetando las indicaciones individualizadas del plan. ".repeat(4).trim();
  const doc = await createNutritionPlanPdf(data, fonts);
  const capture = documents.at(-1);
  assert.equal(doc.getNumberOfPages(), 1);
  assertAllMealsPreserved(capture, data);
  assertBounds(capture);
});

test("indications begin beside their bold label and retain explicit paragraph spacing", async () => {
  const data = model();
  data.indicaciones = "Primera indicación individual.\n\nSegunda indicación individual.";
  await createNutritionPlanPdf(data, fonts);
  const capture = documents.at(-1);
  const label = capture.texts.find(({ text }) => text === "Indicaciones:");
  const first = capture.texts.find(({ text }) => text === "Primera indicación individual.");
  const second = capture.texts.find(({ text }) => text === "Segunda indicación individual.");
  assert.equal(label.fontStyle, "bold");
  assert.equal(first.fontStyle, "normal");
  assert.equal(first.y, label.y);
  assert.ok(first.x > label.x + label.width);
  assert.equal(second.x, NUTRITION_DOCUMENT_STYLE.margin);
  assert.ok(Math.abs(second.y - first.y - NUTRITION_DOCUMENT_STYLE.lineHeight * 2) < 0.001);
  assertBounds(capture);
});

test("long cells split across pages with repeated headers and no clipped text", async () => {
  const documentModel = model(true);
  const doc = await createNutritionPlanPdf(documentModel, fonts);
  const capture = documents.at(-1);
  assert.ok(doc.getNumberOfPages() > 3);
  assertBounds(capture);
  const tablePages = new Set(capture.texts.filter(({ text }) => text.includes("Contenido individual")).map(({ page }) => page));
  for (const page of tablePages) for (const meal of NUTRITION_MEALS) assert.ok(capture.texts.some((row) => row.page === page && row.text === meal.label.toLocaleUpperCase("es")), `missing ${meal.label} on ${page}`);
  const footerCount = capture.texts.filter(({ text }) => text.startsWith("Página ")).length;
  assert.equal(footerCount, doc.getNumberOfPages());
  // Compare each column end-to-end, including split rows: not one character of
  // any meal may disappear or change order between the editor and the PDF.
  assertAllMealsPreserved(capture, documentModel);
  assert.ok(capture.texts.some(({ text }) => text === "Indicaciones:"));
});

test("a complete day moves to the next page when only the current remainder is too short", async () => {
  const data = model();
  data.semana.forEach((row, index) => row.comidas.forEach((meal) => {
    meal.value = Array.from({ length: 14 }, (_, line) => `D${index} fila ${line + 1}`).join("\n");
  }));
  const doc = await createNutritionPlanPdf(data, fonts);
  const capture = documents.at(-1);
  assert.ok(doc.getNumberOfPages() > 1);
  const tuesday = capture.texts.find(({ text }) => text === "Martes");
  const wednesday = capture.texts.find(({ text }) => text === "Miércoles");
  assert.equal(tuesday.page, 1);
  assert.equal(wednesday.page, 2, "Wednesday must move as a whole, not start with an orphaned fragment on page 1");
  for (let index = 0; index < data.semana.length; index += 1) {
    const pages = new Set(capture.texts.filter(({ text }) => text.startsWith(`D${index} fila `)).map(({ page }) => page));
    assert.equal(pages.size, 1, `${data.semana[index].dia} should stay together because it fits a fresh page`);
    assert.ok(!capture.texts.some(({ text }) => text.startsWith(`${data.semana[index].dia} (cont.`)));
  }
  assertBounds(capture);
});

test("a tall first day starts on page one instead of orphaning the initial table header", async () => {
  const data = model();
  data.semana[0].comidas.forEach((meal) => {
    meal.value = Array.from({ length: 41 }, (_, index) => `Primera fila ${index + 1}`).join("\n");
  });
  await createNutritionPlanPdf(data, fonts);
  const capture = documents.at(-1);
  const firstDay = capture.texts.filter(({ text }) => text.startsWith("Primera fila "));
  assert.ok(firstDay.some(({ page }) => page === 1), "Page one must contain actual meal data, not only a heading");
  assert.ok(firstDay.some(({ page }) => page === 2), "The tall first day continues with repeated headers");
  const tablePages = new Set(capture.rectangles.map(({ page }) => page));
  for (const page of tablePages) {
    assert.ok(capture.rectangles.some((rectangle) => rectangle.page === page && matchesColor(rectangle.fill, NUTRITION_DOCUMENT_STYLE.colors.day)), `Orphaned table header on page ${page}`);
  }
  assertAllMealsPreserved(capture, data);
  assertBounds(capture);
});

test("long indications repeat a continuation label without orphaning it or losing any text", async () => {
  const data = model();
  data.indicaciones = Array.from({ length: 130 }, (_, index) => `Indicacion-${index + 1}: observación individual para este paciente.`).join("\n");
  await createNutritionPlanPdf(data, fonts);
  const capture = documents.at(-1);
  const labelIndex = capture.texts.findIndex(({ text }) => text === "Indicaciones:");
  const renderedNotes = capture.texts.slice(labelIndex + 1).filter(({ fontSize, fontStyle, align }) => fontSize === 9 && fontStyle === "normal" && align === "left");
  assert.equal(compact(renderedNotes.map(({ text }) => text).join("")), compact(data.indicaciones));
  const continuationLabels = capture.texts.filter(({ text }) => text === "Indicaciones (continuación):");
  assert.ok(continuationLabels.length >= 2);
  for (const label of continuationLabels) {
    assert.ok(renderedNotes.some((entry) => entry.page === label.page && entry.y > label.y && entry.y <= label.y + NUTRITION_DOCUMENT_STYLE.lineHeight + 0.001));
  }
  assertBounds(capture);
});

test("indications move to a fresh page with their first answer when the grid fills the page", async () => {
  const data = model();
  data.semana.forEach((row) => row.comidas.forEach((meal) => {
    meal.value = Array.from({ length: 5 }, (_, index) => `Preparación ${index + 1}`).join("\n");
  }));
  const doc = await createNutritionPlanPdf(data, fonts);
  const capture = documents.at(-1);
  const lastDay = capture.texts.find(({ text, fontSize }) => text === "Domingo" && fontSize === 8);
  const label = capture.texts.find(({ text }) => text === "Indicaciones:");
  const answer = capture.texts.find(({ text }) => text === data.indicaciones);
  assert.equal(doc.getNumberOfPages(), 2);
  assert.equal(lastDay.page, 1);
  assert.equal(label.page, 2);
  assert.equal(answer.page, label.page);
  assert.equal(answer.y, label.y);
  assertBounds(capture);
});

test("long unbroken inputs and long patient name are wrapped within page margins", async () => {
  const data = model();
  data.paciente = "NombreCompleto".repeat(35);
  data.semana[0].comidas[0].value = "Palabra".repeat(250);
  await createNutritionPlanPdf(data, fonts);
  assertBounds(documents.at(-1));
});

test("licensed embedded Unicode font preserves Spanish, Greek beta and Cyrillic text", async () => {
  const data = model();
  data.paciente = "María Pérez · София";
  data.semana[0].comidas[0].value = "β-caroteno, piña, proteína, café y yogur. Ελληνικά.";
  await validateNutritionPdfModel(data, fonts);
  const doc = await createNutritionPlanPdf(data, fonts);
  const capture = documents.at(-1);
  assert.ok(capture.texts.some(({ text }) => text.includes("β-caroteno")));
  assert.ok(capture.texts.some(({ text }) => text.includes("София")));
  assert.equal(doc.getFont().fontName, "NutritionSans");
  assert.ok(doc.getFont().metadata.characterToGlyph("β".codePointAt(0)) > 0);
  assert.ok(doc.getFont().metadata.characterToGlyph("ñ".codePointAt(0)) > 0);
  const actualPdf = doc.output();
  assert.ok(actualPdf.includes("/FontFile2"));
  assert.ok(actualPdf.includes("/ToUnicode"));
  assertBounds(capture);
});

test("unsupported avocado emoji is reported explicitly before immutable finalization", async () => {
  const data = model();
  data.semana[0].comidas[0].value = "Palta 🥑 con pan";
  const original = data.semana[0].comidas[0].value;
  const unsupported = (error) => error.code === "NUTRITION_UNSUPPORTED_GLYPH" && error.message.includes("🥑") && error.message.includes("U+1F951");
  await assert.rejects(validateNutritionPdfModel(data, fonts), unsupported);
  await assert.rejects(createNutritionPlanPdf(data, fonts), unsupported);
  assert.equal(data.semana[0].comidas[0].value, original, "Never delete or replace unsupported input silently");
});

test("application preview uses same model without browser PDF embed or HTML interpretation", () => {
  const data = model();
  data.semana[0].comidas[0].value = "<script>alert('not markup')</script>";
  const html = renderToStaticMarkup(createElement(Preview, { model: data }));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(!/<iframe|<embed|<object/u.test(html));
  assert.ok(html.includes("scope=\"col\""));
  for (const day of data.semana) assert.ok(html.includes(day.dia));
  for (const { value } of data.indicadores) assert.ok(html.includes(value));
});
