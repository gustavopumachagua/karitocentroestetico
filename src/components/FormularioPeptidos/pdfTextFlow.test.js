import assert from "node:assert/strict";
import test from "node:test";
import { layoutPdfTextFlow } from "./pdfTextFlow.js";

const measure = (text, kind) =>
  Array.from(text).reduce(
    (size, character) => size + (character === " " ? 0.4 : kind === "label" ? 0.8 : 0.7),
    0,
  );
const readable = (flow) =>
  flow.lines.map((line) => line.runs.map((run) => run.text).join("")).join("\n");
const withoutWhitespace = (value) => value.replace(/\s/gu, "");
const assertBounds = (flow, width) => {
  for (const line of flow.lines) {
    assert.ok(line.width <= width + 1e-7, `Line exceeds ${width}: ${line.width}`);
    let rightEdge = 0;
    for (const run of line.runs) {
      assert.ok(run.x >= rightEdge - 1e-7);
      rightEdge = run.x + measure(run.text, run.kind);
      assert.ok(rightEdge <= width + 1e-7);
    }
    assert.ok(Math.abs(line.width - rightEdge) < 1e-7);
  }
  assert.equal(flow.height, flow.lines.length * flow.lineHeight);
};

test("brief clinical answers share the label's first baseline after its colon", () => {
  for (const [label, content] of [
    ["Presión arterial sistólica (mmHg)", "111"],
    ["Nombre completo", "Ángela Pérez"],
    ["Sexo", "Femenino"],
    ["Motivo principal", "Manejo de sobrepeso/obesidad"],
  ]) {
    const flow = layoutPdfTextFlow({ label, content, width: 90, measure });
    assert.equal(flow.lines.length, 1);
    assert.equal(flow.lines[0].runs[0].kind, "label");
    assert.equal(flow.lines[0].runs[0].text, `${label}: `);
    assert.equal(flow.lines[0].runs[1].kind, "value");
    assert.equal(flow.lines[0].runs[1].text, content);
    assert.equal(readable(flow), `${label}: ${content}`);
    assertBounds(flow, 90);
  }
});

test("long narratives begin inline and wrap without losing clinical characters", () => {
  const label = "Observaciones";
  const content = "Paciente con evolución favorable; continúa con su tratamiento. ".repeat(90);
  const flow = layoutPdfTextFlow({ label, content, width: 45, measure });
  assert.ok(flow.lines.length > 20);
  assert.ok(flow.lines[0].runs.some((run) => run.kind === "value"));
  assert.equal(withoutWhitespace(readable(flow)), withoutWhitespace(`${label}: ${content}`));
  assertBounds(flow, 45);
});

test("explicit line breaks and blank paragraphs survive layout", () => {
  const flow = layoutPdfTextFlow({
    label: "Plan",
    content: "Primera indicación\r\n\r\nSegunda indicación\nControl posterior\rFinal\n",
    width: 90,
    measure,
  });
  assert.equal(
    readable(flow),
    "Plan: Primera indicación\n\nSegunda indicación\nControl posterior\nFinal\n",
  );
  assert.deepEqual(flow.lines[1], { runs: [], width: 0 });
  assertBounds(flow, 90);
});

test("long unspaced answers split by Unicode code point and fill the first line", () => {
  const label = "Dato";
  const content = "áéíóú🩺ABC".repeat(60);
  const flow = layoutPdfTextFlow({ label, content, width: 13, measure });
  assert.ok(flow.lines[0].runs.some((run) => run.kind === "value"));
  assert.equal(withoutWhitespace(readable(flow)), withoutWhitespace(`${label}: ${content}`));
  for (const line of flow.lines) {
    for (const run of line.runs) {
      assert.ok(!/^[\uDC00-\uDFFF]|[\uD800-\uDBFF]$/u.test(run.text));
    }
  }
  assertBounds(flow, 13);
});

test("long labels and a narrow field remain ordered and bounded", () => {
  const label = "Evaluación clínica extraordinariamente detallada";
  const content = "12345678901234567890";
  const flow = layoutPdfTextFlow({ label, content, width: 2.5, measure });
  assert.ok(flow.lines.length > 10);
  assert.equal(withoutWhitespace(readable(flow)), withoutWhitespace(`${label}: ${content}`));
  assertBounds(flow, 2.5);
});

test("layout preserves zero and never mutates the caller's data", () => {
  const options = Object.freeze({ label: "Valor", content: 0, width: 25, measure, lineHeight: 5 });
  const flow = layoutPdfTextFlow(options);
  assert.equal(readable(flow), "Valor: 0");
  assert.equal(flow.height, 5);
  assert.equal(options.content, 0);
  flow.lines[0].runs[0].text = "changed";
  assert.equal(readable(layoutPdfTextFlow(options)), "Valor: 0");
});

test("empty answers have an explicit placeholder without changing input", () => {
  for (const content of ["", "  ", null, undefined]) {
    assert.equal(readable(layoutPdfTextFlow({ label: "Resultado", content, width: 25, measure })), "Resultado: —");
  }
});

test("font kerning is measured on complete runs, not added isolated words", () => {
  const kernedMeasure = (text) => text.length - (text.includes("AV AV") ? 0.5 : 0);
  const flow = layoutPdfTextFlow({ label: "AV AV", content: "x", width: 9.5, measure: kernedMeasure });
  assert.equal(flow.lines.length, 1);
  assert.equal(flow.lines[0].width, 7.5);
  assert.equal(flow.lines[0].runs[1].x, 6.5);
});

test("invalid dimensions and measurements fail explicitly instead of dropping text", () => {
  for (const width of [0, -1, NaN, Infinity]) {
    assert.throws(() => layoutPdfTextFlow({ label: "Dato", content: "1", width, measure }), RangeError);
  }
  assert.throws(() => layoutPdfTextFlow({ label: "Dato", content: "1", width: 20, measure, lineHeight: 0 }), RangeError);
  assert.throws(() => layoutPdfTextFlow({ label: "Dato", content: "1", width: 20 }), TypeError);
  assert.throws(() => layoutPdfTextFlow({ label: "Dato", content: "1", width: 20, measure: () => NaN }), RangeError);
  assert.throws(() => layoutPdfTextFlow({ label: "Dato", content: "1", width: 0.1, measure }), RangeError);
});
