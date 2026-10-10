import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { createRequire, Module } from "node:module";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL("../../../", import.meta.url));
const rendererPath = fileURLToPath(new URL("./ClinicalHistoryPdf.jsx", import.meta.url));
const actualJsPdfPath = require.resolve("jspdf");

// Compile JSX in memory and use the real jsPDF implementation. Instrumenting
// drawing calls verifies layout without replacing actual PDF generation or
// requiring a browser, accounts, a server, or real clinical records.
const bundle = await build({
  absWorkingDir: projectRoot,
  stdin: {
    contents: `export * from ${JSON.stringify(rendererPath)};
      export { capturedDocuments } from "__pdf_test_trace__";`,
    resolveDir: projectRoot,
    sourcefile: "clinical-pdf-tests-entry.js",
  },
  write: false,
  bundle: true,
  format: "cjs",
  platform: "node",
  define: { "import.meta.env": "{}" },
  jsx: "automatic",
  external: ["react", "react/jsx-runtime"],
  plugins: [{
    name: "clinical-pdf-test-adapters",
    setup(builder) {
      builder.onResolve({ filter: /^(jspdf|__pdf_test_trace__)$/ }, () => ({ path: "jspdf", namespace: "pdf-test-trace" }));
      builder.onResolve({ filter: /^__actual_jspdf__$/ }, () => ({ path: actualJsPdfPath, external: true }));
      builder.onResolve({ filter: /^html2pdf\.js$/ }, () => ({ path: "html2pdf", namespace: "pdf-test-fallback" }));
      builder.onLoad({ filter: /.*/, namespace: "pdf-test-fallback" }, () => ({
        contents: 'export default function html2pdf() { throw new Error("Unexpected HTML fallback in vector PDF regression"); }',
      }));
      builder.onLoad({ filter: /.*/, namespace: "pdf-test-trace" }, () => ({
        contents: `import { jsPDF as ActualJsPDF } from "__actual_jspdf__";
          export const capturedDocuments = [];
          export function jsPDF(options) {
            const doc = new ActualJsPDF(options);
            const capture = { doc, options, texts: [], images: [], rectangles: [] };
            capturedDocuments.push(capture);
            const originalText = doc.text;
            doc.text = function(text, x, y, settings, ...rest) {
              const values = Array.isArray(text) ? text : [text];
              const factor = settings?.lineHeightFactor ?? doc.getLineHeightFactor();
              const lineHeight = doc.getFontSize() / doc.internal.scaleFactor * factor;
              const lines = values.map((value, index) => ({
                text: String(value), x, y: y + index * lineHeight,
                width: doc.getTextWidth(String(value)),
                align: settings?.align || "left",
              }));
              capture.texts.push({ lines, page: doc.internal.getCurrentPageInfo().pageNumber,
                fontSize: doc.getFontSize(), fontStyle: doc.getFont().fontStyle });
              return originalText.call(doc, text, x, y, settings, ...rest);
            };
            const originalImage = doc.addImage;
            doc.addImage = function(...args) {
              const result = originalImage.apply(doc, args);
              capture.images.push({ page: doc.internal.getCurrentPageInfo().pageNumber,
                x: args[2], y: args[3], width: args[4], height: args[5] });
              return result;
            };
            const originalRect = doc.rect;
            doc.rect = function(x, y, width, height, style) {
              capture.rectangles.push({ x, y, width, height, style: style || "S" });
              return originalRect.call(doc, x, y, width, height, style);
            };
            return doc;
          }`,
      }));
    },
  }],
});
const moduleFilename = path.join(projectRoot, "__clinical_pdf_regression__.cjs");
const compiledModule = new Module(moduleFilename);
compiledModule.filename = moduleFilename;
compiledModule.paths = Module._nodeModulePaths(projectRoot);
compiledModule._compile(bundle.outputFiles[0].text, moduleFilename);
const {
  capturedDocuments,
  ClinicalHistoryPdfDocument,
  generateClinicalHistoryPdfBlob,
  getClinicalHistoryPdfSections,
  getClinicalHistoryPdfErrorMessage,
} = compiledModule.exports;

// Valid generated one-pixel PNG; common pasted samples have invalid IDAT CRCs.
const SIGNATURE_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAX+XDSwAAAABJRU5ErkJggg==";
const BRAND = "KARITO BEAUTY ESTHETIC CENTER S.A.C.";
const compactText = (value) => value.replace(/\s/gu, "");
const allLines = (capture) => capture.texts.flatMap((call) => call.lines.map((line) => ({
  ...line, page: call.page, fontSize: call.fontSize, fontStyle: call.fontStyle,
})));
const findLine = (capture, text) => allLines(capture).find((line) => line.text === text);
const markup = (record) => renderToStaticMarkup(createElement(ClinicalHistoryPdfDocument, { record }));
const generate = async (record) => {
  const firstCapture = capturedDocuments.length;
  const blob = await generateClinicalHistoryPdfBlob(null, record);
  const capture = capturedDocuments.slice(firstCapture).find((item) => item.options?.compress);
  assert.ok(capture, "The vector renderer must create a real compressed jsPDF document");
  assert.ok(blob instanceof Blob);
  assert.ok(blob.size > 500);
  assert.equal(await blob.slice(0, 5).text(), "%PDF-");
  return { blob, capture };
};
const assertClinicalBounds = (capture) => {
  for (const line of allLines(capture)) {
    assert.ok(line.y >= 13.9, `${line.text} is above the page content`);
    const footer = line.text === "Documento clínico confidencial" || /^Página \d+$/u.test(line.text);
    assert.ok(line.y <= (footer ? 289.1 : 282.1), `${line.text} overflows page ${line.page}: ${line.y}`);
    const left = line.align === "right" ? line.x - line.width
      : line.align === "center" ? line.x - line.width / 2 : line.x;
    assert.ok(left >= 14.9, `${line.text} overflows left margin: ${left}`);
    assert.ok(left + line.width <= 195.1, `${line.text} overflows right margin: ${left + line.width}`);
  }
};

const representativeRecord = {
  patient: { nombre: "Paciente de demostración", sexo: "Femenino" },
  signatureUrl: SIGNATURE_PNG,
  formData: {
    nombreCompleto: "Paciente de demostración", sexo: "Femenino", dni: "12345678",
    fechaNacimiento: "1990-05-15", edad: "36", telefono: "900000000", ocupacion: "Profesional independiente",
    fechaConsulta: "2026-10-10", medicoTratante: "Dra. Profesional de demostración",
    motivoPrincipal: "Manejo de sobrepeso/obesidad", dificultadPeso: "Dificultad gradual durante los últimos dos años.",
    objetivoPaciente: "Mejorar sus hábitos y realizar seguimiento clínico periódico.",
    pesoMaximo: "88.5", pesoHabitual: "78", pesoActual: "82.5", talla: "1.65", imc: "30.3", perimetroAbdominal: "94",
    evolucionPeso: "Incremento progresivo relacionado con hábitos de alimentación y menor actividad física.",
    intentosPrevios: ["Dieta", "Ejercicio"], tratamientosPreviosRespuesta: "Respuesta parcial a cambios de hábitos.",
    enfermedadesAntecedentes: ["Diabetes mellitus tipo 2", "Hipertensión arterial"],
    cirugiasPrevias: "No", hospitalizacionesPrevias: "No", alergiaMedicamentos: "No", alergiasAlimentarias: "No",
    alergiaLatex: "No", reaccionesAdversas: "No", transfusionesSanguineas: "No",
    antecedentesFamiliares: ["Diabetes mellitus tipo 2", "Hipertensión arterial"],
    fum: "2026-09-22", g: "1", p: "1", c: "0", a: "0", metodoAnticonceptivo: "Método de barrera",
    embarazoActual: "No", posibilidadEmbarazo: "No", lactancia: "No",
    medicamentosActuales: "Medicamento de demostración, según indicación previa.", suplementosVitaminas: "Vitamina de demostración",
    tratamientosPreviosPeso: [
      { medicamento: "Tratamiento de demostración A", dosis: "Dosis registrada", tiempoUso: "3 meses", resultado: "Respuesta parcial; sin reacciones descritas." },
      { medicamento: "Tratamiento de demostración B", dosis: "Dosis registrada", tiempoUso: "2 meses", resultado: "Seguimiento clínico previo." },
    ],
    agonistasGlp1: "No", alimentacionHabitual: "Mixta", comidasDia: "3", sensacionHambre: "Moderada",
    antojosPicoteo: "Sí", actividadFisica: "Sí", actividadFrecuencia: "Caminata tres veces por semana.",
    horasSueno: "7", calidadSueno: "Buena", consumoAlcohol: "No", observacionesHabitos: "Reforzar horarios regulares y hábitos saludables.",
    sintomasActuales: ["Fatiga"], otrosSintomas: "Sin otros síntomas referidos.",
    carcinomaMedularPersonal: "No", carcinomaMedularFamiliar: "No", men2PersonalFamiliar: "No", enfermedadTiroideaConocida: "No",
    pancreatitisPrevia: "No", dolorAbdominalRecurrente: "No", litiasisVesicular: "No", colecistitis: "No", cirugiaVesicula: "No",
    enfermedadHepatica: "No", ictericiaPrevia: "No", gastroparesia: "No", enfermedadGiImportante: "No", enfermedadRenal: "No",
    deshidratacionReciente: "No", hipoglucemiasPrevias: "No", insulina: "No", sulfonilureas: "No", otrosMedDiabetes: "No", otrosMedPeso: "No",
    presionSistolica: "111", presionDiastolica: "72", frecuenciaCardiaca: "76", pesoClinico: "82.5", tallaClinica: "1.65", imcClinico: "30.3",
    perimetroAbdominalClinico: "94", examenFisico: "Evaluación de demostración sin hallazgos relevantes adicionales.",
    fechaLaboratorio: "2026-10-08", glucosaAyunas: "95 mg/dL", hba1c: "5.5 %", creatinina: "0.8 mg/dL", tfge: "90 mL/min/1.73 m²",
    tgoAst: "24 U/L", tgpAlt: "25 U/L", colesterolTotal: "180 mg/dL", ldl: "100 mg/dL", hdl: "55 mg/dL", trigliceridos: "120 mg/dL", tsh: "2.0 mUI/L",
    diagnosticos: ["Diagnóstico de demostración para seguimiento clínico."], comorbilidades: "Factores metabólicos en evaluación.",
    factoresRiesgo: "Antecedentes familiares y hábitos de actividad física.", observacionesClinicas: "Explicación del plan y seguimiento individualizado.",
    conductaPlan: "Iniciar tratamiento", medicamentoIndicado: "Tratamiento de demostración", presentacion: "Presentación registrada", dosisInicial: "Según indicación clínica",
    fechaInicioTratamiento: "2026-10-11", proximoControl: "2026-11-10", indicacionesObservaciones: "Mantener seguimiento clínico y comunicar cualquier reacción adversa.",
    consentimientoInformado: "Sí", consentimientoFecha: "2026-10-10", observacionesAdicionales: "Se dejó constancia de la información proporcionada.",
    nombreFirmaMedico: "Dra. Profesional de demostración", cmpConstancia: "123456", fechaConstancia: "2026-10-10",
  },
};

test("real PDF and application preview keep short answers after the colon", async () => {
  const record = {
    patient: { sexo: "Masculino" },
    formData: { nombreCompleto: "Paciente Ejemplo", medicoTratante: "Dr. Profesional Ejemplo", sexo: "Masculino", motivoPrincipal: "Reducción de peso", presionSistolica: "111" },
  };
  const { capture } = await generate(record);
  const html = markup(record);
  for (const [label, value] of [["Nombre completo", "Paciente Ejemplo"], ["Médico tratante", "Dr. Profesional Ejemplo"], ["Sexo", "Masculino"], ["Motivo principal", "Reducción de peso"], ["Presión arterial sistólica (mmHg)", "111"]]) {
    const labelLine = findLine(capture, `${label}: `);
    const valueLine = findLine(capture, value);
    assert.ok(labelLine, `Missing label: ${label}`);
    assert.ok(valueLine, `Missing answer: ${value}`);
    assert.equal(labelLine.y, valueLine.y);
    assert.equal(labelLine.page, valueLine.page);
    assert.ok(valueLine.x > labelLine.x);
    assert.ok(html.includes(`${label}: </span><span class="whitespace-pre-wrap text-slate-950">${value}</span>`));
  }
  assertClinicalBounds(capture);
});

test("long selected answers use the full width and preserve clinical field order", async () => {
  const value = "Diabetes mellitus tipo 2, Hipertensión arterial";
  const record = { patient: { sexo: "Masculino" }, formData: { enfermedadesAntecedentes: value, cirugiasPrevias: "No", hospitalizacionesPrevias: "Sí" } };
  const { capture } = await generate(record);
  const labelLine = findLine(capture, "Enfermedades / antecedentes: ");
  const answerLine = findLine(capture, value);
  assert.equal(answerLine.y, labelLine.y);
  assert.ok(answerLine.x + answerLine.width > 102, "A wide answer should not be squeezed into one column");
  assert.ok(findLine(capture, "Cirugías previas: ").y > answerLine.y);
  const html = markup(record);
  assert.ok(html.indexOf(value) < html.indexOf("Cirugías previas:"));
  assertClinicalBounds(capture);
});

test("record contents remain untouched while empty fields, sex and dynamic diagnoses are respected", async () => {
  const record = { patient: { sexo: "Masculino" }, formData: { nombreCompleto: "Paciente Ejemplo", sexo: "Masculino", embarazoActual: "No", diagnosticos: ["Primero", "Segundo", "Tercero", "Cuarto"], motivoOtro: "", dni: "", consentimientoInformado: "Sí" } };
  const original = JSON.stringify(record);
  const { capture } = await generate(record);
  const html = markup(record);
  assert.equal(JSON.stringify(record), original);
  assert.ok(!html.includes("GINECO-OBSTÉTRICOS"));
  assert.ok(!html.includes("Otro motivo:"));
  assert.ok(!html.includes("DNI:"));
  assert.ok(html.includes("Diagnóstico 4:"));
  assert.ok(findLine(capture, "Diagnóstico 4: "));
  const female = structuredClone(record);
  female.patient.sexo = "Femenino";
  female.formData.sexo = "Femenino";
  assert.ok(markup(female).includes("GINECO-OBSTÉTRICOS"));
  const headings = getClinicalHistoryPdfSections(record.patient, record.formData);
  assert.equal(headings.length, 3);
  assert.ok(allLines(capture).some((line) => line.text === "III. CONSTANCIA MÉDICA"));
});

test("representative document has a single opening brand and keeps the normal certificate with its signature", async () => {
  const { blob, capture } = await generate(representativeRecord);
  const headers = allLines(capture).filter((line) => line.text === BRAND);
  assert.equal(headers.length, 1);
  assert.equal(headers[0].page, 1);
  assert.ok(capture.doc.getNumberOfPages() > 1);
  assert.equal(capture.images.length, 1, "The physician signature must be embedded in the vector PDF");
  const heading = findLine(capture, "XV. CONSTANCIA MÉDICA");
  assert.ok(heading);
  assert.equal(heading.page, capture.images[0].page);
  assert.equal(findLine(capture, "XII. EXÁMENES AUXILIARES").page,
    findLine(capture, "Glucosa en ayunas").page, "The laboratory heading and its ordinary results stay together");
  assert.ok(capture.images[0].y + capture.images[0].height <= 282);
  assert.equal((markup(representativeRecord).match(new RegExp(BRAND.replace(/\./gu, "\\."), "gu")) || []).length, 1);
  assertClinicalBounds(capture);
  if (process.env.CLINICAL_PDF_TEST_OUTPUT) {
    await writeFile(process.env.CLINICAL_PDF_TEST_OUTPUT, new Uint8Array(await blob.arrayBuffer()));
  }
});

test("multi-page narratives retain every clinical character within printable bounds", async () => {
  const narrative = "Relato de demostración: evolución y seguimiento periódico sin pérdida de información. ".repeat(350)
    + "\n\nINDICACIÓN_FINAL";
  const { capture } = await generate({ patient: { sexo: "Masculino" }, formData: { objetivoPaciente: narrative } });
  assert.ok(capture.doc.getNumberOfPages() >= 4);
  const narrativeLines = allLines(capture).filter((line) => line.fontSize === 9 && line.fontStyle === "normal");
  assert.equal(compactText(narrativeLines.map((line) => line.text).join("\n")), compactText(narrative));
  assert.equal(allLines(capture).filter((line) => line.text === BRAND).length, 1);
  assertClinicalBounds(capture);
});

test("giant treatment cells are continued on later pages with repeated clear table headings", async () => {
  const result = "RESULTADO_DE_PRUEBA: respuesta y evolución sin omitir información. ".repeat(300) + "FIN_DEL_RESULTADO";
  const { capture } = await generate({ patient: { sexo: "Masculino" }, formData: {
    tratamientosPreviosPeso: [{ medicamento: "Medicamento de demostración", dosis: "Dosis de prueba", tiempoUso: "Tiempo de prueba", resultado: result }],
  } });
  assert.ok(capture.doc.getNumberOfPages() >= 3);
  const resultLines = allLines(capture).filter((line) => line.fontSize === 8.5 && line.fontStyle === "normal" && Math.abs(line.x - 142) < 0.01);
  assert.equal(compactText(resultLines.map((line) => line.text).join("\n")), compactText(result));
  assert.ok(allLines(capture).filter((line) => line.text === "Medicamento" && line.fontStyle === "bold").length >= 3);
  assert.ok(!capture.rectangles.some((rectangle) => rectangle.style.includes("F")), "Table headers must never use an opaque filled rectangle");
  const html = markup({ patient: { sexo: "Masculino" }, formData: { tratamientosPreviosPeso: [{ medicamento: "Ejemplo" }], glucosaAyunas: "95" } });
  for (const header of html.match(/<th[^>]*>/gu) || []) assert.ok(!/bg-/u.test(header));
  assertClinicalBounds(capture);
});

const withProtectedSignatureBrowser = async (callback, fetchImpl) => {
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  const previousReader = globalThis.FileReader;
  globalThis.window = { localStorage: { getItem: (key) => key === "token" ? "authorized-test-session" : null } };
  globalThis.fetch = fetchImpl;
  globalThis.FileReader = class {
    readAsDataURL(blob) {
      blob.arrayBuffer().then((bytes) => {
        this.result = `data:${blob.type};base64,${btoa(String.fromCharCode(...new Uint8Array(bytes)))}`;
        this.onload();
      });
    }
  };
  try {
    await callback();
  } finally {
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
    globalThis.fetch = previousFetch;
    if (previousReader === undefined) delete globalThis.FileReader; else globalThis.FileReader = previousReader;
  }
};

test("authorized protected signature is fetched with Bearer and embedded in a real PDF", async () => {
  const source = "/api/media/signatures/111111111111111111111111?v=123";
  let calls = 0;
  await withProtectedSignatureBrowser(async () => {
    const { capture } = await generate({ ...representativeRecord, signatureUrl: source });
    assert.equal(calls, 1);
    assert.equal(capture.images.length, 1);
  }, async (url, options) => {
    calls += 1;
    assert.equal(url, source);
    assert.equal(options.headers.Authorization, "Bearer authorized-test-session");
    assert.equal(options.cache, "no-store");
    assert.equal(options.redirect, "error");
    const bytes = Uint8Array.from(atob(SIGNATURE_PNG.split(",")[1]), (character) => character.charCodeAt(0));
    return new Response(new Blob([bytes], { type: "image/png" }));
  });
});

test("401 or 403 signature denial stops both PDF renderers without an anonymous retry", async () => {
  for (const status of [401, 403]) {
    let calls = 0;
    let clones = 0;
    const firstCapture = capturedDocuments.length;
    const element = { cloneNode() { clones += 1; throw new Error("Unauthorized fallback must not run"); } };
    await withProtectedSignatureBrowser(async () => {
      await assert.rejects(generateClinicalHistoryPdfBlob(element, {
        ...representativeRecord, signatureUrl: "/api/media/histories/222222222222222222222222/signature",
      }), (error) => error.status === status);
      assert.equal(calls, 1);
      assert.equal(clones, 0);
      assert.equal(capturedDocuments.length, firstCapture);
      assert.ok(getClinicalHistoryPdfErrorMessage({ status }).includes(status === 401 ? "sesión" : "permiso"));
    }, async () => { calls += 1; return new Response("Denied", { status }); });
  }
});

test("legacy public signature cannot be anonymously fetched during PDF export", async () => {
  let calls = 0;
  await withProtectedSignatureBrowser(async () => {
    await assert.rejects(generateClinicalHistoryPdfBlob(null, {
      ...representativeRecord,
      signatureUrl: "https://res.cloudinary.com/example/image/upload/firmas/old.webp",
    }), (error) => error.status === 400);
    assert.equal(calls, 0);
  }, async () => { calls += 1; throw new Error("Public signature fetch forbidden"); });
});

test("logout during signature conversion cancels PDF export before either renderer", async () => {
  const firstCapture = capturedDocuments.length;
  await withProtectedSignatureBrowser(async () => {
    const AuthorizedReader = globalThis.FileReader;
    globalThis.FileReader = class extends AuthorizedReader {
      readAsDataURL(blob) {
        globalThis.window.localStorage.getItem = () => null;
        super.readAsDataURL(blob);
      }
    };
    await assert.rejects(generateClinicalHistoryPdfBlob(null, {
      ...representativeRecord, signatureUrl: "/api/media/signatures/111111111111111111111111",
    }), (error) => error.status === 401);
    assert.equal(capturedDocuments.length, firstCapture);
  }, async () => new Response(new Blob([Uint8Array.from(atob(SIGNATURE_PNG.split(",")[1]), (character) => character.charCodeAt(0))], { type: "image/png" })));
});
