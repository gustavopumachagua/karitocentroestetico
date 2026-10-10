/* eslint-disable react-refresh/only-export-components */
// This module intentionally exports the renderer and its PDF helpers together:
// both consumers must share the same clinical model and field layout.
import { forwardRef } from "react";
import html2pdf from "html2pdf.js";
import { jsPDF } from "jspdf";
import { layoutPdfTextFlow } from "./pdfTextFlow";
import {
  isFemalePatient,
  normalizeDiagnosisValues,
  withLegacyDiagnosisFields,
} from "./formConfig";

const PDF_LAYOUT = {
  pageWidth: 210,
  pageHeight: 297,
  marginLeft: 15,
  marginRight: 15,
  marginTop: 14,
  marginBottom: 17,
};
const PDF_TYPE = { body: 9, label: 9, section: 10.5, table: 8.5, small: 7.5 };
const PDF_LINE_HEIGHT = 4.25;
const PDF_COLUMN_GAP = 6;
const PDF_FIELD_ROW_GAP = 1.5;
const PDF_SECTION_HEADING_HEIGHT = 7;
const getContentWidth = () => PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginLeft - PDF_LAYOUT.marginRight;
let fieldMetricsDocument;
const getFieldMetricsDocument = () => {
  fieldMetricsDocument ||= new jsPDF({ unit: "mm", format: "a4" });
  return fieldMetricsDocument;
};

const toRoman = (value) => {
  const numerals = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let remainder = value;
  return numerals.reduce((result, [amount, symbol]) => {
    while (remainder >= amount) {
      result += symbol;
      remainder -= amount;
    }
    return result;
  }, "");
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const hasValue = (value) => {
  if (Array.isArray(value)) return value.some((item) => hasValue(item));
  return value !== null && value !== undefined && String(value).trim() !== "";
};

const formatValue = (value, type) => {
  if (!hasValue(value)) return "—";
  if (type === "date") return formatDate(value);
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

const getFilledTreatmentRows = (rows) => {
  if (!Array.isArray(rows)) return [];

  return rows.filter((row) =>
    Object.values(row || {}).some((value) => hasValue(value)),
  );
};

const treatmentRows = (rows) => {
  const filledRows = getFilledTreatmentRows(rows);

  if (!filledRows.length) return "—";

  return filledRows
    .map((row) =>
      [
        row.medicamento && `Medicamento: ${row.medicamento}`,
        row.dosis && `Dosis: ${row.dosis}`,
        row.tiempoUso && `Tiempo: ${row.tiempoUso}`,
        row.resultado && `Resultado: ${row.resultado}`,
      ]
        .filter(Boolean)
        .join(" · "),
    )
    .join(" | ");
};

const hasPrintableValue = (value, type) =>
  type === "treatments"
    ? getFilledTreatmentRows(value).length > 0
    : hasValue(value);

const SECTIONS = [
  {
    id: "datos-identificacion",
    title: "DATOS DE IDENTIFICACIÓN",
    fields: [
      ["Nombre completo", "nombreCompleto"],
      ["Sexo", "sexo"],
      ["DNI", "dni"],
      ["Fecha de nacimiento", "fechaNacimiento", "date"],
      ["Edad", "edad"],
      ["Teléfono", "telefono"],
      ["Ocupación", "ocupacion"],
      ["Fecha de consulta", "fechaConsulta", "date"],
      ["Médico tratante", "medicoTratante"],
    ],
  },
  {
    id: "motivo-consulta",
    title: "MOTIVO DE CONSULTA",
    fields: [
      ["Motivo principal", "motivoPrincipal"],
      ["Otro motivo", "motivoOtro"],
      ["Dificultad para controlar el peso", "dificultadPeso"],
      ["Objetivo del paciente", "objetivoPaciente"],
    ],
  },
  {
    id: "historia-peso",
    title: "HISTORIA Y EVOLUCIÓN DEL PESO",
    fields: [
      ["Peso máximo alcanzado (kg)", "pesoMaximo"],
      ["Peso habitual (kg)", "pesoHabitual"],
      ["Peso actual (kg)", "pesoActual"],
      ["Talla (m)", "talla"],
      ["IMC (kg/m²)", "imc"],
      ["Perímetro abdominal (cm)", "perimetroAbdominal"],
      ["Evolución del peso / factores asociados", "evolucionPeso"],
      ["Intentos previos", "intentosPrevios"],
      ["Otros intentos", "intentosOtros"],
      ["Tratamientos previos y respuesta", "tratamientosPreviosRespuesta"],
    ],
  },
  {
    id: "antecedentes-personales",
    title: "ANTECEDENTES PERSONALES",
    fields: [
      ["Enfermedades / antecedentes", "enfermedadesAntecedentes"],
      ["Otros antecedentes", "enfermedadesOtros"],
      ["Especificar", "enfermedadesEspecificar"],
      ["Cirugías previas", "cirugiasPrevias"],
      ["Cirugía / procedimiento", "cirugiaProcedimiento"],
      ["Fecha de cirugía", "cirugiaFecha", "date"],
      ["Complicaciones", "cirugiaComplicaciones"],
      ["Hospitalizaciones previas", "hospitalizacionesPrevias"],
      ["Motivo de hospitalización", "hospitalizacionMotivo"],
      ["Alergia a medicamentos", "alergiaMedicamentos"],
      ["Medicamento", "alergiaMedicamento"],
      ["Reacción", "alergiaReaccion"],
      ["Alergias alimentarias", "alergiasAlimentarias"],
      ["Alimento", "alergiaAlimentariaCual"],
      ["Alergia al látex", "alergiaLatex"],
      ["Otras alergias", "alergiaLatexOtras"],
      ["Reacciones adversas", "reaccionesAdversas"],
      ["Medicamento de reacción adversa", "reaccionAdversaMedicamento"],
      ["Transfusiones sanguíneas", "transfusionesSanguineas"],
    ],
  },
  {
    id: "antecedentes-familiares",
    title: "ANTECEDENTES FAMILIARES",
    fields: [
      ["Antecedentes", "antecedentesFamiliares"],
      ["Otros antecedentes", "familiaresOtros"],
      ["Especificar", "familiaresEspecificar"],
    ],
  },
  {
    id: "gineco-obstetricos",
    title: "ANTECEDENTES GINECO-OBSTÉTRICOS",
    femaleOnly: true,
    fields: [
      ["FUM", "fum"],
      ["G", "g"],
      ["P", "p"],
      ["C", "c"],
      ["A", "a"],
      ["Método anticonceptivo", "metodoAnticonceptivo"],
      ["Embarazo actual", "embarazoActual"],
      ["Posibilidad de embarazo", "posibilidadEmbarazo"],
      ["Lactancia", "lactancia"],
    ],
  },
  {
    id: "medicacion-actual",
    title: "MEDICACIÓN ACTUAL Y TRATAMIENTOS PREVIOS",
    fields: [
      ["Medicamentos actuales", "medicamentosActuales"],
      ["Suplementos / vitaminas", "suplementosVitaminas"],
      ["Tratamientos previos de control de peso", "tratamientosPreviosPeso", "treatments"],
      ["Uso previo de agonistas GLP-1", "agonistasGlp1"],
      ["Medicamento agonista", "agonistaMedicamento"],
      ["Dosis agonista", "agonistaDosis"],
      ["Respuesta al agonista", "agonistaRespuesta"],
    ],
  },
  {
    id: "habitos-estilo",
    title: "HÁBITOS Y ESTILO DE VIDA",
    fields: [
      ["Alimentación habitual", "alimentacionHabitual"],
      ["Comidas al día", "comidasDia"],
      ["Sensación de hambre", "sensacionHambre"],
      ["Antojos / picoteo", "antojosPicoteo"],
      ["Actividad física", "actividadFisica"],
      ["Frecuencia de actividad", "actividadFrecuencia"],
      ["Horas de sueño", "horasSueno"],
      ["Calidad de sueño", "calidadSueno"],
      ["Consumo de alcohol", "consumoAlcohol"],
      ["Observaciones", "observacionesHabitos"],
    ],
  },
  {
    id: "sintomas-actuales",
    title: "SÍNTOMAS ACTUALES",
    fields: [
      ["Síntomas actuales", "sintomasActuales"],
      ["Otros síntomas relevantes", "otrosSintomas"],
    ],
  },
  {
    id: "evaluacion-seguridad",
    title: "EVALUACIÓN DE SEGURIDAD PREVIA AL INICIO",
    fields: [
      ["Carcinoma medular de tiroides personal", "carcinomaMedularPersonal"],
      ["Carcinoma medular de tiroides familiar", "carcinomaMedularFamiliar"],
      ["MEN 2 personal / familiar", "men2PersonalFamiliar"],
      ["Enfermedad tiroidea conocida", "enfermedadTiroideaConocida"],
      ["Pancreatitis previa", "pancreatitisPrevia"],
      ["Dolor abdominal recurrente", "dolorAbdominalRecurrente"],
      ["Litiasis vesicular", "litiasisVesicular"],
      ["Colecistitis", "colecistitis"],
      ["Cirugía de vesícula", "cirugiaVesicula"],
      ["Enfermedad hepática", "enfermedadHepatica"],
      ["Ictericia previa", "ictericiaPrevia"],
      ["Gastroparesia diagnosticada", "gastroparesia"],
      ["Enfermedad gastrointestinal importante", "enfermedadGiImportante"],
      ["Enfermedad renal", "enfermedadRenal"],
      ["Deshidratación reciente", "deshidratacionReciente"],
      ["Hipoglucemias previas", "hipoglucemiasPrevias"],
      ["Uso de insulina", "insulina"],
      ["Uso de sulfonilureas", "sulfonilureas"],
      ["Otros medicamentos para diabetes", "otrosMedDiabetes"],
      ["Otros medicamentos para peso", "otrosMedPeso"],
    ],
  },
  {
    id: "evaluacion-clinica",
    title: "EVALUACIÓN CLÍNICA",
    fields: [
      ["Presión arterial sistólica (mmHg)", "presionSistolica"],
      ["Presión arterial diastólica (mmHg)", "presionDiastolica"],
      ["Frecuencia cardíaca (lpm)", "frecuenciaCardiaca"],
      ["Peso (kg)", "pesoClinico"],
      ["Talla (m)", "tallaClinica"],
      ["IMC (kg/m²)", "imcClinico"],
      ["Perímetro abdominal (cm)", "perimetroAbdominalClinico"],
      ["Examen físico relevante", "examenFisico"],
    ],
  },
  {
    id: "examenes-auxiliares",
    title: "EXÁMENES AUXILIARES",
    fields: [
      ["Fecha de laboratorio", "fechaLaboratorio", "date"],
      ["Glucosa en ayunas", "glucosaAyunas"],
      ["HbA1c", "hba1c"],
      ["Creatinina", "creatinina"],
      ["TFGe / eGFR", "tfge"],
      ["TGO / AST", "tgoAst"],
      ["TGP / ALT", "tgpAlt"],
      ["Colesterol total", "colesterolTotal"],
      ["LDL", "ldl"],
      ["HDL", "hdl"],
      ["Triglicéridos", "trigliceridos"],
      ["TSH", "tsh"],
      ["Otros exámenes", "otrosExamenes"],
    ],
  },
  {
    id: "evaluacion-medica",
    title: "EVALUACIÓN MÉDICA",
    fields: [
      ["Diagnóstico 1", "diagnostico1"],
      ["Diagnóstico 2", "diagnostico2"],
      ["Diagnóstico 3", "diagnostico3"],
      ["Comorbilidades asociadas", "comorbilidades"],
      ["Factores de riesgo", "factoresRiesgo"],
      ["Observaciones clínicas", "observacionesClinicas"],
    ],
  },
  {
    id: "conducta-plan",
    title: "CONDUCTA Y PLAN",
    fields: [
      ["Conducta", "conductaPlan"],
      ["Otra conducta", "conductaOtro"],
      ["Medicamento indicado", "medicamentoIndicado"],
      ["Presentación", "presentacion"],
      ["Dosis inicial", "dosisInicial"],
      ["Fecha prevista de inicio", "fechaInicioTratamiento", "date"],
      ["Próximo control", "proximoControl", "date"],
      ["Indicaciones / observaciones", "indicacionesObservaciones"],
    ],
  },
  {
    id: "constancia-medica",
    title: "CONSTANCIA MÉDICA",
    fields: [
      ["Consentimiento informado", "consentimientoInformado"],
      ["Fecha del consentimiento", "consentimientoFecha", "date"],
      ["Observaciones adicionales", "observacionesAdicionales"],
      ["Nombre y firma del médico", "nombreFirmaMedico"],
      ["CMP", "cmpConstancia"],
      ["Fecha de constancia", "fechaConstancia", "date"],
    ],
  },
];

const DIAGNOSIS_FIELD_PATTERN = /^diagnostico\d+$/;

const getDiagnosisPdfFields = (formData) =>
  normalizeDiagnosisValues(formData).map((_, index) => [
    `Diagnóstico ${index + 1}`,
    `diagnostico${index + 1}`,
  ]);

const getSectionPdfFields = (section, formData) => {
  if (section.id !== "evaluacion-medica") return section.fields;

  return [
    ...getDiagnosisPdfFields(formData),
    ...section.fields.filter(([, key]) => !DIAGNOSIS_FIELD_PATTERN.test(key)),
  ];
};

export function getClinicalHistoryPdfSections(patient, formData) {
  const onlyFilledFields = formData && typeof formData === "object";
  const normalizedData = withLegacyDiagnosisFields(formData || {});

  return SECTIONS.filter(
    (section) => !section.femaleOnly || isFemalePatient(patient?.sexo),
  )
    .map((section) => ({
      ...section,
      fields: onlyFilledFields
        ? getSectionPdfFields(section, normalizedData).filter(([, key, type]) =>
            hasPrintableValue(normalizedData[key], type),
          )
        : getSectionPdfFields(section, normalizedData),
    }))
    .filter((section) => section.fields.length > 0);
}

const SIGNATURE_FIELD_KEYS = new Set(["nombreFirmaMedico", "cmpConstancia"]);

const getSignatureUrl = (record, patient, data) =>
  [
    record?.signatureUrl,
    record?.firmaMedico?.url,
    data?.firmaDigital,
    patient?.firmaDigital,
  ].find((url) => hasValue(url));

const getClinicalHistoryPdfModel = (record) => {
  const patient = record?.patient || {};
  const data = withLegacyDiagnosisFields(record?.formData || {});
  const sections = getClinicalHistoryPdfSections(
    {
      ...patient,
      sexo: data.sexo || patient.sexo,
    },
    data,
  );

  return {
    patient,
    data,
    sections,
    doctor: data.medicoTratante || data.nombreFirmaMedico || "Médico tratante",
    signatureUrl: getSignatureUrl(record, patient, data),
  };
};

const getFieldContent = (value, type) =>
  type === "treatments" ? treatmentRows(value) : formatValue(value, type);

// Written answers get the full reading width, but still begin after the colon.
// The same field policy and font measurements govern both rendering paths.
const NARRATIVE_FIELD_KEYS = new Set([
  "nombreCompleto",
  "ocupacion",
  "medicoTratante",
  "motivoOtro",
  "dificultadPeso",
  "objetivoPaciente",
  "evolucionPeso",
  "intentosOtros",
  "tratamientosPreviosRespuesta",
  "enfermedadesOtros",
  "enfermedadesEspecificar",
  "cirugiaProcedimiento",
  "hospitalizacionMotivo",
  "alergiaMedicamento",
  "alergiaReaccion",
  "alergiaAlimentariaCual",
  "alergiaLatexOtras",
  "reaccionAdversaMedicamento",
  "familiaresOtros",
  "familiaresEspecificar",
  "fum",
  "metodoAnticonceptivo",
  "medicamentosActuales",
  "suplementosVitaminas",
  "agonistaMedicamento",
  "agonistaDosis",
  "agonistaRespuesta",
  "actividadFrecuencia",
  "observacionesHabitos",
  "otrosSintomas",
  "examenFisico",
  "diagnostico1",
  "diagnostico2",
  "diagnostico3",
  "comorbilidades",
  "factoresRiesgo",
  "observacionesClinicas",
  "conductaOtro",
  "medicamentoIndicado",
  "presentacion",
  "dosisInicial",
  "indicacionesObservaciones",
  "observacionesAdicionales",
]);

const getFieldPresentation = (field, data) => {
  const [label, key, type] = field;
  return { label, key, type, content: getFieldContent(data[key], type) };
};

const shouldUseFullWidth = (field, data, doc) => {
  const { label, key, type, content } = getFieldPresentation(field, data);
  const metrics = doc || getFieldMetricsDocument();
  metrics.setFont("helvetica", "bold");
  metrics.setFontSize(PDF_TYPE.label);
  const labelWidth = metrics.getTextWidth(`${label}: `);
  metrics.setFont("helvetica", "normal");
  metrics.setFontSize(PDF_TYPE.body);
  const textWidth = labelWidth + metrics.getTextWidth(content);
  return (
    type === "treatments" ||
    NARRATIVE_FIELD_KEYS.has(key) ||
    DIAGNOSIS_FIELD_PATTERN.test(key) ||
    content.includes("\n") ||
    textWidth > (getContentWidth() - PDF_COLUMN_GAP) / 2
  );
};

// The PDF and the fallback DOM renderer must make the same decision for every
// row. In particular, a short field immediately before a long field occupies
// its own row, instead of being packed beside a field that will span both
// columns. This keeps the clinical reading order stable in every output.
const getPdfFieldRows = (fields, data, doc) => {
  const rows = [];
  let fieldIndex = 0;

  while (fieldIndex < fields.length) {
    const first = fields[fieldIndex];
    const second = fields[fieldIndex + 1];
    const firstIsWide = shouldUseFullWidth(first, data, doc);
    const secondIsWide = second && shouldUseFullWidth(second, data, doc);

    if (!second || firstIsWide || secondIsWide) {
      rows.push([first]);
      fieldIndex += 1;
      continue;
    }

    rows.push([first, second]);
    fieldIndex += 2;
  }

  return rows;
};

const getSectionPrintableParts = (section) => {
  const treatmentField = section.fields.find(([, , type]) => type === "treatments");
  const regularFields = section.fields.filter(
    ([, key, type]) => type !== "treatments" && !SIGNATURE_FIELD_KEYS.has(key),
  );
  const laboratoryFields =
    section.id === "examenes-auxiliares"
      ? regularFields.filter(([, key]) => key !== "fechaLaboratorio")
      : [];
  const standardFields =
    section.id === "examenes-auxiliares"
      ? regularFields.filter(([, key]) => key === "fechaLaboratorio")
      : regularFields;

  return { treatmentField, laboratoryFields, standardFields };
};

const PdfField = ({ field, data }) => {
  const { label, content } = getFieldPresentation(field, data);

  return (
    <div className="min-w-0" style={{ paddingBottom: `${PDF_FIELD_ROW_GAP}mm` }}>
      <p style={{ fontSize: `${PDF_TYPE.body}pt`, lineHeight: `${PDF_LINE_HEIGHT}mm`, overflowWrap: "anywhere" }}>
        <span className="font-semibold text-slate-700">{label}: </span>
        <span className="whitespace-pre-wrap text-slate-950">{content}</span>
      </p>
    </div>
  );
};

const TreatmentTable = ({ rows }) => {
  const filledRows = getFilledTreatmentRows(rows);
  if (!filledRows.length) return null;

  return (
    <div className="break-inside-avoid" style={{ marginTop: "3mm" }}>
      <p className="font-semibold text-slate-800" style={{ marginBottom: "2mm", fontSize: `${PDF_TYPE.body}pt` }}>
        Tratamientos previos para control de peso
      </p>
      <table className="w-full table-fixed border-collapse text-left text-slate-950" style={{ fontSize: `${PDF_TYPE.table}pt`, lineHeight: "4mm" }}>
        <colgroup>
          <col className="w-[27%]" />
          <col className="w-[19%]" />
          <col className="w-[23%]" />
          <col className="w-[31%]" />
        </colgroup>
        <thead>
          <tr>
            {["Medicamento", "Dosis", "Tiempo de uso", "Resultado / efectos adversos"].map(
              (heading) => (
                <th
                  key={heading}
                  className="border-y border-slate-400 px-2 py-2 align-bottom font-semibold break-words"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {filledRows.map((row, index) => (
            <tr key={`${row.medicamento || "tratamiento"}-${index}`}>
              {[row.medicamento, row.dosis, row.tiempoUso, row.resultado].map(
                (value, cellIndex) => (
                  <td key={cellIndex} className="border-b border-slate-200 px-2 py-2 align-top" style={{ overflowWrap: "anywhere" }}>
                    {hasValue(value) ? String(value) : "—"}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AuxiliaryExamsTable = ({ fields, data }) => {
  const rows = [];
  for (let index = 0; index < fields.length; index += 2) {
    rows.push([fields[index], fields[index + 1]]);
  }

  if (!rows.length) return null;

  return (
    <table className="w-full table-fixed border-collapse text-left text-slate-950" style={{ marginTop: "3mm", fontSize: `${PDF_TYPE.table}pt`, lineHeight: "4mm" }}>
      <colgroup>
        <col className="w-[24%]" />
        <col className="w-[26%]" />
        <col className="w-[24%]" />
        <col className="w-[26%]" />
      </colgroup>
      <thead>
        <tr>
          {["Examen", "Resultado", "Examen", "Resultado"].map((heading, index) => (
            <th
              key={`${heading}-${index}`}
              className="border-y border-slate-400 px-2 py-2 align-bottom font-semibold break-words"
            >
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([left, right]) => (
          <tr key={`${left?.[1] || "left"}-${right?.[1] || "right"}`}>
            <td className="border-b border-slate-200 px-2 py-2 font-semibold" style={{ overflowWrap: "anywhere" }}>{left?.[0] || ""}</td>
            <td className="border-b border-slate-200 px-2 py-2" style={{ overflowWrap: "anywhere" }}>{left ? getFieldContent(data[left[1]], left[2]) : ""}</td>
            <td className="border-b border-slate-200 px-2 py-2 font-semibold" style={{ overflowWrap: "anywhere" }}>{right?.[0] || ""}</td>
            <td className="border-b border-slate-200 px-2 py-2" style={{ overflowWrap: "anywhere" }}>{right ? getFieldContent(data[right[1]], right[2]) : ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const SectionPreview = ({ section, index, data }) => {
  const { treatmentField, laboratoryFields, standardFields } = getSectionPrintableParts(section);
  const fieldRows = getPdfFieldRows(standardFields, data);
  const hasAuxiliaryExams = laboratoryFields.length > 0;

  return (
    <section
      style={{ marginBottom: hasAuxiliaryExams ? "9mm" : "6mm" }}
    >
      <div className="border-b border-slate-300" style={{ paddingBottom: "2mm", marginBottom: "3mm", breakAfter: "avoid", pageBreakAfter: "avoid" }}>
        <h2 className="font-semibold uppercase text-slate-950" style={{ fontSize: `${PDF_TYPE.section}pt`, letterSpacing: "0.02em" }}>
          {toRoman(index + 1)}. {section.title}
        </h2>
      </div>
      {fieldRows.length > 0 && (
        <div>
          {fieldRows.map((row) => (
            <div
              key={row.map(([, key]) => key).join("-")}
              className={row.length === 2 ? "grid grid-cols-2" : ""}
              style={{ columnGap: `${PDF_COLUMN_GAP}mm`, breakInside: "avoid" }}
            >
              {row.map((field) => (
                <PdfField key={field[1]} field={field} data={data} />
              ))}
            </div>
          ))}
        </div>
      )}
      {treatmentField && <TreatmentTable rows={data[treatmentField[1]]} />}
      {hasAuxiliaryExams && <AuxiliaryExamsTable fields={laboratoryFields} data={data} />}
    </section>
  );
};

const ClinicalSignatureFooter = ({ signatureUrl, doctor, cmp }) => (
  <footer style={{ paddingTop: "3mm", breakInside: "avoid" }}>
    <div className="mx-auto text-center text-slate-950" style={{ maxWidth: "78mm", fontSize: `${PDF_TYPE.body}pt`, lineHeight: `${PDF_LINE_HEIGHT}mm` }}>
      {signatureUrl ? (
        <img
          src={signatureUrl}
          alt="Firma digital del médico"
          className="mx-auto object-contain"
          style={{ height: "16mm", maxWidth: "68mm", marginBottom: "4mm" }}
          data-pdf-image="signature"
        />
      ) : (
        <div style={{ height: "20mm" }} />
      )}
      <div className="border-t border-slate-400 pt-1 font-semibold" style={{ overflowWrap: "anywhere" }}>{doctor}</div>
      {hasValue(cmp) && <div>CMP: {cmp}</div>}
    </div>
    <p className="text-slate-600" style={{ marginTop: "6mm", fontSize: `${PDF_TYPE.small}pt`, lineHeight: "3.6mm" }}>
      Nota: Este documento corresponde a la historia clínica inicial. La evolución y los controles
      posteriores se registran en una ficha de control separada.
    </p>
  </footer>
);

/**
 * Print-ready document. The visible preview and the downloadable file share
 * the same clinical model, so only fields with an entered value are shown.
 */
export const ClinicalHistoryPdfDocument = forwardRef(function ClinicalHistoryPdfDocument(
  { record, className = "" },
  ref,
) {
  const { data, sections, doctor, signatureUrl } = getClinicalHistoryPdfModel(record);

  return (
    <article
      ref={ref}
      className={`box-border bg-white text-black ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "14mm 15mm 17mm",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <header className="border-b border-slate-400" style={{ paddingBottom: "6mm", marginBottom: "7mm" }}>
        <p className="font-semibold text-slate-700" style={{ fontSize: "8.5pt", letterSpacing: "0.04em" }}>
          KARITO BEAUTY ESTHETIC CENTER S.A.C.
        </p>
        <h1 className="font-bold tracking-tight text-slate-950" style={{ marginTop: "3mm", fontSize: "21pt" }}>Historia clínica</h1>
        <p className="text-slate-700" style={{ marginTop: "2mm", fontSize: "9.5pt" }}>
          Evaluación para manejo de peso con tirzepatida
        </p>
      </header>

      <div>
        {sections.map((section, index) => {
          const isMedicalCertificate = section.id === "constancia-medica";
          const preview = <SectionPreview section={section} index={index} data={data} />;

          // Keeping the certificate and the signature in one print block means
          // a browser-based fallback never leaves the heading at the foot of a
          // page and the signature alone on the next one.
          if (isMedicalCertificate) {
            return (
              <div
                key={section.id}
                className="break-inside-avoid"
                style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
              >
                {preview}
                <ClinicalSignatureFooter
                  signatureUrl={signatureUrl}
                  doctor={doctor}
                  cmp={data.cmpConstancia}
                />
              </div>
            );
          }

          return <SectionPreview key={section.id} section={section} index={index} data={data} />;
        })}
      </div>

      {!sections.some((section) => section.id === "constancia-medica") && (
        <ClinicalSignatureFooter
          signatureUrl={signatureUrl}
          doctor={doctor}
          cmp={data.cmpConstancia}
        />
      )}
    </article>
  );
});

export function getClinicalHistoryPdfFileName(record) {
  const name = record?.formData?.nombreCompleto || record?.patient?.nombre || "paciente";
  const safeName = String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();

  return `historia-clinica-${safeName || "paciente"}.pdf`;
}

const cleanupPdfArtifacts = () => {
  if (typeof document === "undefined") return;

  // html2pdf removes this node only after html2canvas resolves. An image that
  // cannot be read (for example, a remote signature without CORS) rejects the
  // worker first and leaves an invisible full-screen overlay over the app.
  document.querySelectorAll(".html2pdf__overlay").forEach((overlay) => {
    overlay.remove();
  });
  // A worker interrupted before attaching its overlay can leave its container
  // behind. It is not interactive by itself, but removing it keeps retries
  // deterministic and prevents a hidden duplicate document from accumulating.
  document.querySelectorAll(".html2pdf__container").forEach((container) => {
    container.remove();
  });
};

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const waitForImage = (image, timeout = 5000) =>
  new Promise((resolve) => {
    if (image.complete) {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      image.removeEventListener("load", finish);
      image.removeEventListener("error", finish);
      resolve();
    };
    const timer = window.setTimeout(finish, timeout);

    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
  });

const preparePdfNode = async (element) => {
  const printableNode = element.cloneNode(true);
  const stagingHost = document.createElement("div");
  // Images in a detached tree are inconsistently loaded by browsers. Stage the
  // clone just outside the viewport so the fallback renderer always receives a
  // fully laid-out document, without covering or intercepting the application.
  Object.assign(stagingHost.style, {
    position: "fixed",
    left: "-30000px",
    top: "0",
    width: "210mm",
    pointerEvents: "none",
  });
  stagingHost.setAttribute("aria-hidden", "true");
  stagingHost.appendChild(printableNode);
  document.body.appendChild(stagingHost);
  const images = Array.from(printableNode.querySelectorAll("img"));

  await Promise.all(
    images.map(async (image) => {
      const source = image.getAttribute("src") || image.src;
      if (!source || source.startsWith("data:") || source.startsWith("blob:")) {
        await waitForImage(image);
        return;
      }

      try {
        // A data URL makes the signature part of the canvas itself, avoiding
        // a tainted canvas while still retaining the exact signed image.
        const response = await fetch(source, {
          mode: "cors",
          credentials: "omit",
        });
        if (!response.ok) throw new Error(`No se pudo cargar la imagen (${response.status}).`);

        image.src = await blobToDataUrl(await response.blob());
      } catch {
        // Cloudinary images normally support CORS. If a legacy URL does not,
        // allow html2canvas to try it anonymously; `allowTaint: false` below
        // ensures that an unavailable image never blocks the whole document.
        image.removeAttribute("src");
        image.crossOrigin = "anonymous";
        image.src = source;
      }

      await waitForImage(image);
    }),
  );

  return {
    printableNode,
    cleanup: () => stagingHost.remove(),
  };
};

export function getClinicalHistoryPdfErrorMessage(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("no se encontró el documento")) {
    return "No se encontró el documento a exportar. Cierra y vuelve a abrir la vista previa antes de intentarlo.";
  }

  return "No se pudo terminar la exportación del PDF. El formulario sigue disponible y ya puedes intentarlo nuevamente sin recargar la página.";
}

const loadImage = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo decodificar la firma digital."));
    image.src = source;
  });

const normalizeSignatureDataUrl = async (dataUrl) => {
  if (!String(dataUrl || "").startsWith("data:image/")) return dataUrl;

  try {
    const image = await loadImage(dataUrl);
    const originalWidth = image.naturalWidth || image.width;
    const originalHeight = image.naturalHeight || image.height;
    if (!originalWidth || !originalHeight) return dataUrl;

    // The upload endpoint stores signatures as WebP. Converting a fetched,
    // same-origin/CORS-safe image to PNG makes embedding reliable in jsPDF
    // across browsers while preserving its transparent background.
    const scale = Math.min(1, 600 / originalWidth, 260 / originalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(originalWidth * scale));
    canvas.height = Math.max(1, Math.round(originalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return dataUrl;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    // jsPDF can still embed most original PNG/JPEG/WebP data URLs. Keeping
    // the source here is preferable to dropping a valid signature outright.
    return dataUrl;
  }
};

const getSignatureDataUrl = async (source) => {
  const signatureSource = typeof source === "string" ? source.trim() : "";
  if (!signatureSource) return "";
  if (signatureSource.startsWith("data:")) return normalizeSignatureDataUrl(signatureSource);

  try {
    const sourceUrl = new URL(signatureSource, window.location.href);
    const response = await fetch(sourceUrl.href, {
      mode: "cors",
      credentials: sourceUrl.origin === window.location.origin ? "include" : "omit",
    });
    if (!response.ok) return "";
    return normalizeSignatureDataUrl(await blobToDataUrl(await response.blob()));
  } catch {
    // A signature image must never prevent the clinical record itself from
    // being downloaded. The DOM fallback below gets one more chance to render
    // legacy image hosts when the browser blocks a CORS fetch.
    return "";
  }
};

const addPdfPageFooter = (context) => {
  const { doc, page } = context;
  doc.setDrawColor(125, 125, 125);
  doc.setLineWidth(0.15);
  doc.line(PDF_LAYOUT.marginLeft, 285, PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight, 285);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(80, 80, 80);
  doc.text("Documento clínico confidencial", PDF_LAYOUT.marginLeft, 289);
  doc.text(`Página ${page}`, PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight, 289, { align: "right" });
  doc.setTextColor(0, 0, 0);
};

const drawPdfHeader = (context) => {
  const { doc } = context;
  const left = PDF_LAYOUT.marginLeft;
  doc.setTextColor(70, 70, 70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("KARITO BEAUTY ESTHETIC CENTER S.A.C.", left, 17);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(21);
  doc.text("Historia clínica", left, 27);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(55, 55, 55);
  doc.text("Evaluación para manejo de peso con tirzepatida", left, 34);
  doc.setDrawColor(155, 155, 155);
  doc.setLineWidth(0.2);
  doc.line(left, 39, PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight, 39);
  context.y = 47;
};

const startNextPdfPage = (context) => {
  addPdfPageFooter(context);
  context.doc.addPage();
  context.page += 1;
  // The clinical title belongs to the opening page only. Continuation pages
  // deliberately start at the normal top margin; their footer still carries
  // the document identity and page number without competing with the data.
  context.y = PDF_LAYOUT.marginTop;
};

const ensurePdfSpace = (context, height) => {
  if (context.y + height <= PDF_LAYOUT.pageHeight - PDF_LAYOUT.marginBottom) return;
  startNextPdfPage(context);
};

const getPdfFieldLayout = (doc, field, data, width) => {
  const presentation = getFieldPresentation(field, data);
  const flow = layoutPdfTextFlow({
    label: presentation.label,
    content: presentation.content,
    width,
    lineHeight: PDF_LINE_HEIGHT,
    measure: (value, kind) => {
      doc.setFont("helvetica", kind === "label" ? "bold" : "normal");
      doc.setFontSize(kind === "label" ? PDF_TYPE.label : PDF_TYPE.body);
      return doc.getTextWidth(value);
    },
  });
  return {
    ...presentation,
    ...flow,
  };
};

const getPdfFieldGridHeight = (context, fields) => {
  const contentWidth = getContentWidth();
  const columnWidth = (contentWidth - PDF_COLUMN_GAP) / 2;
  const rows = getPdfFieldRows(fields, context.data, context.doc);

  return rows.reduce((height, row) => {
    const [first, second] = row;
    const firstWidth = second ? columnWidth : contentWidth;
    const firstLayout = getPdfFieldLayout(context.doc, first, context.data, firstWidth);
    const secondLayout = second
      ? getPdfFieldLayout(context.doc, second, context.data, columnWidth)
      : null;

    return height + Math.max(firstLayout.height, secondLayout?.height || 0) + PDF_FIELD_ROW_GAP;
  }, 0);
};

const drawPdfField = (context, x, y, layout, offset = 0, count = layout.lines.length) => {
  const { doc } = context;
  layout.lines.slice(offset, offset + count).forEach((line, index) => {
    line.runs.forEach((run) => {
      const isLabel = run.kind === "label";
      doc.setFont("helvetica", isLabel ? "bold" : "normal");
      doc.setFontSize(isLabel ? PDF_TYPE.label : PDF_TYPE.body);
      doc.setTextColor(isLabel ? 55 : 15, isLabel ? 55 : 15, isLabel ? 55 : 15);
      doc.text(run.text, x + run.x, y + index * layout.lineHeight);
    });
  });
};

const drawPdfFieldGrid = (context, fields) => {
  const contentWidth = getContentWidth();
  const columnWidth = (contentWidth - PDF_COLUMN_GAP) / 2;
  const rows = getPdfFieldRows(fields, context.data, context.doc);
  const pageContentHeight = PDF_LAYOUT.pageHeight - PDF_LAYOUT.marginTop - PDF_LAYOUT.marginBottom;

  rows.forEach((row, rowIndex) => {
    const [first, second] = row;
    const firstWidth = second ? columnWidth : contentWidth;
    const firstLayout = getPdfFieldLayout(context.doc, first, context.data, firstWidth);
    const secondLayout = second ? getPdfFieldLayout(context.doc, second, context.data, columnWidth) : null;
    const lineCount = Math.max(firstLayout.lines.length, secondLayout?.lines.length || 0);
    const rowHeight = lineCount * PDF_LINE_HEIGHT + PDF_FIELD_ROW_GAP;
    const isFirstRowUnderHeading = rowIndex === 0 &&
      context.y <= PDF_LAYOUT.marginTop + PDF_SECTION_HEADING_HEIGHT + 0.1;
    if (rowHeight <= pageContentHeight && !isFirstRowUnderHeading) ensurePdfSpace(context, rowHeight);

    // Split exceptionally long answers by complete text lines, never by
    // clipping a canvas or drawing an entire paragraph beyond the page.
    let offset = 0;
    while (offset < lineCount) {
      ensurePdfSpace(context, PDF_LINE_HEIGHT + PDF_FIELD_ROW_GAP);
      const availableHeight = PDF_LAYOUT.pageHeight - PDF_LAYOUT.marginBottom - context.y - PDF_FIELD_ROW_GAP;
      const count = Math.min(lineCount - offset, Math.max(1, Math.floor(availableHeight / PDF_LINE_HEIGHT)));
      drawPdfField(context, PDF_LAYOUT.marginLeft, context.y, firstLayout, offset, count);
      if (secondLayout) drawPdfField(context, PDF_LAYOUT.marginLeft + columnWidth + PDF_COLUMN_GAP,
        context.y, secondLayout, offset, count);
      context.y += count * PDF_LINE_HEIGHT;
      offset += count;
      if (offset < lineCount) startNextPdfPage(context);
    }
    context.y += PDF_FIELD_ROW_GAP;
  });
};

const getPdfTableHeaderLayout = (doc, headers, widths) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(PDF_TYPE.table);

  const lines = headers.map((header, index) =>
    doc.splitTextToSize(header, Math.max(1, widths[index] - 4)),
  );
  const longestHeader = Math.max(...lines.map((headerLines) => headerLines.length), 1);

  return {
    lines,
    height: Math.max(7, longestHeader * 4 + 3),
  };
};

const drawPdfTableHeader = (context, headers, widths, layout) => {
  const { doc } = context;
  const x = PDF_LAYOUT.marginLeft;
  const y = context.y;
  const { lines, height } = layout || getPdfTableHeaderLayout(doc, headers, widths);
  let position = x;

  doc.setDrawColor(130, 130, 130);
  doc.setLineWidth(0.2);
  doc.line(x, y, x + getContentWidth(), y);
  doc.line(x, y + height, x + getContentWidth(), y + height);
  headers.forEach((_, index) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(PDF_TYPE.table);
    doc.setTextColor(30, 30, 30);
    doc.text(lines[index], position + 2, y + 4.3, { lineHeightFactor: 4 / (PDF_TYPE.table * 25.4 / 72) });
    position += widths[index];
  });
  context.y += height;
  return height;
};

const drawPdfTable = (context, headers, widths, rows) => {
  if (!rows.length) return;
  const headerLayout = getPdfTableHeaderLayout(context.doc, headers, widths);
  const lineHeight = 4;
  const cellPadding = 3;
  const bottom = PDF_LAYOUT.pageHeight - PDF_LAYOUT.marginBottom;
  ensurePdfSpace(context, headerLayout.height + lineHeight + cellPadding);
  drawPdfTableHeader(context, headers, widths, headerLayout);

  rows.forEach((row) => {
    const cellLines = row.map((value, index) => {
      context.doc.setFont("helvetica", "normal");
      context.doc.setFontSize(PDF_TYPE.table);
      return context.doc.splitTextToSize(hasValue(value) ? String(value) : "—", widths[index] - 4);
    });
    const lineCount = Math.max(...cellLines.map((lines) => lines.length), 1);
    const height = lineCount * lineHeight + cellPadding;
    const fullPageRowHeight = bottom - PDF_LAYOUT.marginTop - headerLayout.height;
    if (context.y + height > bottom && height <= fullPageRowHeight) {
      startNextPdfPage(context);
      drawPdfTableHeader(context, headers, widths, headerLayout);
    }
    let offset = 0;
    while (offset < lineCount) {
      if (context.y + lineHeight + cellPadding > bottom) {
        startNextPdfPage(context);
        drawPdfTableHeader(context, headers, widths, headerLayout);
      }
      const count = Math.min(lineCount - offset, Math.max(1, Math.floor((bottom - context.y - cellPadding) / lineHeight)));
      const fragmentHeight = count * lineHeight + cellPadding;
      let position = PDF_LAYOUT.marginLeft;
      cellLines.forEach((lines, index) => {
        context.doc.setFont("helvetica", "normal");
        context.doc.setFontSize(PDF_TYPE.table);
        context.doc.setTextColor(15, 15, 15);
        const fragment = lines.slice(offset, offset + count);
        if (fragment.length) context.doc.text(fragment, position + 2, context.y + 4.3,
          { lineHeightFactor: lineHeight / (PDF_TYPE.table * 25.4 / 72) });
        position += widths[index];
      });
      context.doc.setDrawColor(195, 195, 195);
      context.doc.setLineWidth(0.15);
      context.doc.line(PDF_LAYOUT.marginLeft, context.y + fragmentHeight,
        PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight, context.y + fragmentHeight);
      context.y += fragmentHeight;
      offset += count;
      if (offset < lineCount) {
        startNextPdfPage(context);
        drawPdfTableHeader(context, headers, widths, headerLayout);
      }
    }
  });
  context.y += 2.5;
};

const getPdfSignatureLayout = (doc, doctor, cmp) => {
  const signatureLineWidth = 78;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(PDF_TYPE.body);
  const doctorLines = doc.splitTextToSize(
    String(doctor || "Médico tratante"),
    signatureLineWidth,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(PDF_TYPE.small);
  const noteLines = doc.splitTextToSize(
    "Nota: Este documento corresponde a la historia clínica inicial. La evolución y los controles posteriores se registran en una ficha de control separada.",
    getContentWidth(),
  );
  const signatureBlockHeight = 27 + doctorLines.length * PDF_LINE_HEIGHT + (hasValue(cmp) ? 4 : 0);

  return {
    doctorLines,
    noteLines,
    signatureLineWidth,
    signatureBlockHeight,
    // This includes the note so the signature block is never separated from
    // the certificate just because the page has only a few millimetres left.
    totalHeight: signatureBlockHeight + 4.5 + noteLines.length * 3.6,
  };
};

const getPdfTableHeight = (doc, headers, widths, rows) => {
  if (!rows.length) return 0;
  const headerHeight = getPdfTableHeaderLayout(doc, headers, widths).height;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(PDF_TYPE.table);
  return headerHeight + rows.reduce((total, row) => {
    const lineCount = Math.max(...row.map((value, index) =>
      doc.splitTextToSize(hasValue(value) ? String(value) : "—", widths[index] - 4).length), 1);
    return total + lineCount * 4 + 3;
  }, 0) + 2.5;
};

const getAuxiliaryExamsPdfRows = (fields, data) => {
  const rows = [];
  for (let index = 0; index < fields.length; index += 2) {
    const left = fields[index];
    const right = fields[index + 1];
    rows.push([
      left?.[0] || "",
      left ? getFieldContent(data[left[1]], left[2]) : "",
      right?.[0] || "",
      right ? getFieldContent(data[right[1]], right[2]) : "",
    ]);
  }
  return rows;
};

const getPdfSectionStartReservation = (context, section, standardFields) => {
  const pageContentHeight =
    PDF_LAYOUT.pageHeight - PDF_LAYOUT.marginTop - PDF_LAYOUT.marginBottom;
  const fieldGridHeight = getPdfFieldGridHeight(context, standardFields);

  if (section.id === "constancia-medica") {
    const signatureLayout = getPdfSignatureLayout(
      context.doc,
      context.doctor,
      context.data.cmpConstancia,
    );
    const certificateHeight =
      // Match the post-section breathing room below and leave a small buffer
      // for the signature renderer's final note-space guard. That keeps the
      // whole certificate, signature and note on the same page whenever the
      // certificate itself fits on one page.
      PDF_SECTION_HEADING_HEIGHT + fieldGridHeight + 6.2 + signatureLayout.totalHeight;

    // A very long written observation may exceed one page. In that exceptional
    // case we still begin it on a fresh page; normal certificates remain fully
    // together with their signature and note.
    return Math.min(certificateHeight, pageContentHeight);
  }

  const { treatmentField, laboratoryFields } = getSectionPrintableParts(section);
  const treatments = treatmentField
    ? getFilledTreatmentRows(context.data[treatmentField[1]]).map((row) =>
        [row.medicamento, row.dosis, row.tiempoUso, row.resultado])
    : [];
  const treatmentHeight = treatments.length ? 5 + getPdfTableHeight(context.doc,
    ["Medicamento", "Dosis", "Tiempo de uso", "Resultado / efectos adversos"],
    [48, 35, 42, 55], treatments) : 0;
  const laboratoryHeight = getPdfTableHeight(context.doc,
    ["Examen", "Resultado", "Examen", "Resultado"], [43, 47, 43, 47],
    getAuxiliaryExamsPdfRows(laboratoryFields, context.data));
  const blockHeight = PDF_SECTION_HEADING_HEIGHT + fieldGridHeight + treatmentHeight + laboratoryHeight + 1;
  // Ordinary sections remain together, especially a laboratory title/date
  // and its result table. Large sections still flow between pages instead of
  // leaving excessive blank space or forcing an oversized block off-page.
  if (blockHeight <= pageContentHeight * 0.55) return blockHeight;

  // Do not leave a section heading alone at the bottom of a page. Reserving
  // its first compact row keeps the document easy to scan without wasting a
  // whole page for large narrative sections.
  const firstRow = getPdfFieldRows(standardFields, context.data, context.doc)[0];
  const columnWidth = (getContentWidth() - PDF_COLUMN_GAP) / 2;
  const firstRowHeight = firstRow
    ? Math.max(...firstRow.map((field) => getPdfFieldLayout(context.doc, field, context.data,
        firstRow.length === 2 ? columnWidth : getContentWidth()).height)) + PDF_FIELD_ROW_GAP
    : 0;
  const tableStartHeight = treatments.length
    ? 5 + getPdfTableHeaderLayout(context.doc,
        ["Medicamento", "Dosis", "Tiempo de uso", "Resultado / efectos adversos"], [48, 35, 42, 55]).height + 7
    : laboratoryFields.length
      ? getPdfTableHeaderLayout(context.doc, ["Examen", "Resultado", "Examen", "Resultado"], [43, 47, 43, 47]).height + 7
      : 0;
  return Math.min(PDF_SECTION_HEADING_HEIGHT + firstRowHeight + tableStartHeight + 2.2, pageContentHeight);
};

const drawPdfSection = (context, section, index) => {
  const { treatmentField, laboratoryFields, standardFields } = getSectionPrintableParts(section);
  ensurePdfSpace(context, getPdfSectionStartReservation(context, section, standardFields));
  context.doc.setFont("helvetica", "bold");
  context.doc.setFontSize(PDF_TYPE.section);
  context.doc.setTextColor(15, 15, 15);
  context.doc.text(`${toRoman(index + 1)}. ${section.title}`, PDF_LAYOUT.marginLeft, context.y);
  context.doc.setDrawColor(185, 185, 185);
  context.doc.setLineWidth(0.15);
  context.doc.line(PDF_LAYOUT.marginLeft, context.y + 2, PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight, context.y + 2);
  context.y += PDF_SECTION_HEADING_HEIGHT;

  drawPdfFieldGrid(context, standardFields);

  if (treatmentField) {
    const rows = getFilledTreatmentRows(context.data[treatmentField[1]]).map((row) => [
      row.medicamento || "",
      row.dosis || "",
      row.tiempoUso || "",
      row.resultado || "",
    ]);
    if (rows.length) {
      ensurePdfSpace(context, 23);
      context.doc.setFont("helvetica", "bold");
      context.doc.setFontSize(PDF_TYPE.body);
      context.doc.text("Tratamientos previos para control de peso", PDF_LAYOUT.marginLeft, context.y);
      context.y += 5;
      drawPdfTable(
        context,
        ["Medicamento", "Dosis", "Tiempo de uso", "Resultado / efectos adversos"],
        [48, 35, 42, 55],
        rows,
      );
    }
  }

  if (laboratoryFields.length) {
    drawPdfTable(
      context,
      ["Examen", "Resultado", "Examen", "Resultado"],
      [43, 47, 43, 47],
      getAuxiliaryExamsPdfRows(laboratoryFields, context.data),
    );
  }

  // Laboratory tables are visually dense. Give the following clinical
  // evaluation heading a deliberate white-space break rather than letting it
  // appear attached to the final table border.
  context.y += laboratoryFields.length ? 9 : 5;
};

const getImageFormat = (dataUrl) => {
  const match = /^data:image\/([^;,]+)/i.exec(dataUrl || "");
  const type = String(match?.[1] || "png").toLowerCase();
  if (type.includes("jpeg") || type.includes("jpg")) return "JPEG";
  if (type.includes("webp")) return "WEBP";
  return "PNG";
};

const drawPdfSignature = (context, signatureDataUrl, doctor, cmp) => {
  const { doc } = context;
  const layout = getPdfSignatureLayout(doc, doctor, cmp);
  const signatureLineStart = (PDF_LAYOUT.pageWidth - layout.signatureLineWidth) / 2;
  const signatureLineEnd = signatureLineStart + layout.signatureLineWidth;

  ensurePdfSpace(context, layout.totalHeight);
  const lineY = context.y + 21;

  if (signatureDataUrl) {
    try {
      const image = doc.getImageProperties(signatureDataUrl);
      const ratio = image.width / image.height || 1;
      const maxWidth = 68;
      const maxHeight = 16;
      let imageWidth = maxWidth;
      let imageHeight = imageWidth / ratio;
      if (imageHeight > maxHeight) {
        imageHeight = maxHeight;
        imageWidth = imageHeight * ratio;
      }
      doc.addImage(
        signatureDataUrl,
        getImageFormat(signatureDataUrl),
        (PDF_LAYOUT.pageWidth - imageWidth) / 2,
        context.y + Math.max(0, 17 - imageHeight),
        imageWidth,
        imageHeight,
      );
    } catch {
      // The document remains valid if an older image format cannot be embedded.
    }
  }

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(signatureLineStart, lineY, signatureLineEnd, lineY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(PDF_TYPE.body);
  doc.text(layout.doctorLines, PDF_LAYOUT.pageWidth / 2, lineY + 4.5,
    { align: "center", lineHeightFactor: PDF_LINE_HEIGHT / (PDF_TYPE.body * 25.4 / 72) });
  if (hasValue(cmp)) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(PDF_TYPE.table);
    doc.text(`CMP: ${cmp}`, PDF_LAYOUT.pageWidth / 2, lineY + 4.5 + layout.doctorLines.length * PDF_LINE_HEIGHT, {
      align: "center",
    });
  }
  context.y = lineY + 6 + layout.doctorLines.length * PDF_LINE_HEIGHT + (hasValue(cmp) ? 4 : 0);
  context.y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(PDF_TYPE.small);
  doc.text(layout.noteLines, PDF_LAYOUT.marginLeft, context.y,
    { lineHeightFactor: 3.6 / (PDF_TYPE.small * 25.4 / 72) });
  context.y += layout.noteLines.length * 3.6;
};

const createClinicalHistoryPdf = async (record) => {
  const { data, sections, doctor, signatureUrl } = getClinicalHistoryPdfModel(record);
  const signatureDataUrl = await getSignatureDataUrl(signatureUrl);
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  doc.setProperties({
    title: "Historia clínica",
    subject: "Evaluación para manejo de peso con tirzepatida",
    author: "KARITO BEAUTY ESTHETIC CENTER S.A.C.",
  });

  const context = { doc, data, doctor, y: PDF_LAYOUT.marginTop, page: 1 };
  drawPdfHeader(context);
  sections.forEach((section, index) => drawPdfSection(context, section, index));
  drawPdfSignature(context, signatureDataUrl, doctor, data.cmpConstancia);
  addPdfPageFooter(context);
  return doc;
};

const assertPdfBlob = (blob) => {
  if (!(blob instanceof Blob) || blob.size < 500) {
    throw new Error("El archivo PDF generado no es válido.");
  }
};

const downloadBlob = (blob, filename) => {
  assertPdfBlob(blob);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
};

export function downloadClinicalHistoryPdfBlob(blob, record) {
  downloadBlob(blob, getClinicalHistoryPdfFileName(record));
}

const renderHtmlFallbackPdf = async (element, record) => {
  if (!element) throw new Error("No se encontró el documento para exportar.");
  const prepared = await preparePdfNode(element);

  try {
    const blob = await html2pdf()
      .set({
        margin: 0,
        filename: getClinicalHistoryPdfFileName(record),
        image: { type: "jpeg", quality: 0.96 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          allowTaint: false,
          imageTimeout: 5000,
          backgroundColor: "#ffffff",
          scrollY: 0,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(prepared.printableNode)
      .outputPdf("blob");

    assertPdfBlob(blob);
    return blob;
  } finally {
    prepared.cleanup();
    cleanupPdfArtifacts();
  }
};

/**
 * Generates the downloadable file from the app preview's clinical model.
 * A DOM-based renderer remains available only as a browser compatibility
 * fallback; the normal path is vector based and has deterministic pagination.
 */
export async function generateClinicalHistoryPdfBlob(element, record) {
  cleanupPdfArtifacts();

  try {
    const pdf = await createClinicalHistoryPdf(record);
    const blob = pdf.output("blob");
    assertPdfBlob(blob);
    return blob;
  } catch (primaryError) {
    if (!element) throw primaryError;

    console.warn(
      "No se pudo generar el PDF vectorial; se usará el renderizado alternativo.",
      primaryError,
    );
    return renderHtmlFallbackPdf(element, record);
  } finally {
    cleanupPdfArtifacts();
  }
}

/**
 * Produces a vector PDF first. This deliberately avoids html2canvas and its
 * full-screen overlay, which is the source of frozen pages and intermittent
 * cross-origin signature failures. The DOM renderer remains a safe fallback
 * for browser-specific jsPDF failures.
 */
export async function downloadClinicalHistoryPdf(element, record) {
  const blob = await generateClinicalHistoryPdfBlob(element, record);
  downloadClinicalHistoryPdfBlob(blob, record);
}
