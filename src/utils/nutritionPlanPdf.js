import { jsPDF } from "jspdf";
import { NUTRITION_MEALS } from "./nutritionPlan.js";
import { assertNutritionPdfGlyphs, installNutritionPdfFonts, loadNutritionPdfFonts } from "./nutritionPlanFonts.js";
import { NUTRITION_DOCUMENT_STYLE, nutritionIndicatorSummary } from "./nutritionPlanPresentation.js";

export async function validateNutritionPdfModel(model, suppliedFonts) {
  const fonts = suppliedFonts || await loadNutritionPdfFonts();
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
  installNutritionPdfFonts(doc, fonts);
  assertNutritionPdfGlyphs(doc, model);
}

/** Measured vector text keeps the weekly grid sharp and selectable at any zoom. */
export async function createNutritionPlanPdf(model, suppliedFonts) {
  const fonts = suppliedFonts || await loadNutritionPdfFonts();
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
  installNutritionPdfFonts(doc, fonts);
  assertNutritionPdfGlyphs(doc, model);

  const { margin, fontSize, lineHeight, cellPadding: padding, headerHeight, columnRatios, colors } = NUTRITION_DOCUMENT_STYLE;
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const bottom = height - 16;
  const availableWidth = width - margin * 2;
  const columns = columnRatios.map((ratio) => availableWidth * ratio);
  const dayFontSize = 8;
  const baseline = 2.9;
  let y = margin;
  let pageHasRows = false;

  const font = (size = fontSize, style = "normal", color = colors.text) => {
    doc.setFont("NutritionSans", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };
  const wrap = (value, maxWidth, options) => doc.splitTextToSize(String(value || "—"), maxWidth, options);
  const rule = (top) => {
    doc.setDrawColor(...colors.grid);
    doc.setLineWidth(0.15);
    doc.line(margin, top, width - margin, top);
  };
  const heading = (initial) => {
    const blocks = [
      { text: String(model.title).toLocaleUpperCase("es"), size: initial ? 18 : 11, bold: true, leading: initial ? 7.2 : 5, gap: initial ? 1.5 : 0.8 },
      { text: `Paciente: ${model.paciente}`, size: initial ? 9 : 8.5, leading: initial ? 4.1 : 3.8, gap: initial ? 0.8 : 0.6 },
      { text: nutritionIndicatorSummary(model), size: initial ? 9 : 8.5, leading: initial ? 4.1 : 3.8, gap: initial ? 3 : 2.5 },
    ];
    return blocks.map((block) => {
      font(block.size, block.bold ? "bold" : "normal");
      return { ...block, lines: wrap(block.text, availableWidth) };
    });
  };
  const firstHeading = heading(true);
  const continuedHeading = heading(false);
  const headingHeight = (blocks) => blocks.reduce((total, block) => total + block.lines.length * block.leading + block.gap, 0);
  const drawHeading = (blocks) => {
    for (const block of blocks) {
      font(block.size, block.bold ? "bold" : "normal");
      for (const row of block.lines) {
        doc.text(row, width / 2, y + block.size / doc.internal.scaleFactor * 0.85, { align: "center" });
        y += block.leading;
      }
      y += block.gap;
    }
  };
  const newPage = () => {
    doc.addPage();
    y = margin;
    pageHasRows = false;
    drawHeading(continuedHeading);
  };
  const cellBox = (x, top, cellWidth, cellHeight, fill) => {
    doc.setFillColor(...fill);
    doc.setDrawColor(...colors.grid);
    doc.setLineWidth(0.15);
    doc.rect(x, top, cellWidth, cellHeight, "FD");
  };
  const tableHeader = () => {
    if (y + headerHeight > bottom) newPage();
    let x = margin;
    ["Día", ...NUTRITION_MEALS.map(({ label }) => label)].forEach((label, index) => {
      cellBox(x, y, columns[index], headerHeight, colors.header);
      font(fontSize, "bold", [255, 255, 255]);
      doc.text(label.toLocaleUpperCase("es"), x + columns[index] / 2, y + headerHeight / 2 + 1.05, { align: "center" });
      x += columns[index];
    });
    y += headerHeight;
  };

  drawHeading(firstHeading);
  tableHeader();
  const freshRowSpace = bottom - margin - headingHeight(continuedHeading) - headerHeight;
  for (const row of model.semana) {
    const values = [row.dia, ...row.comidas.map(({ value }) => value)];
    const cells = values.map((value, index) => {
      font(index === 0 ? dayFontSize : fontSize);
      return wrap(value, columns[index] - padding * 2);
    });
    const count = Math.max(...cells.map((cell) => cell.length));
    const fullRowHeight = count * lineHeight + padding * 2;
    // Keep each day together when a fresh page can hold it. If this page has
    // only its heading, start the long row here rather than leaving it empty.
    // Continued chunks always repeat the column and day labels.
    if (pageHasRows && fullRowHeight > bottom - y && fullRowHeight <= freshRowSpace) {
      newPage();
      tableHeader();
    }
    let offset = 0;
    while (offset < count) {
      let capacity = Math.floor((bottom - y - padding * 2) / lineHeight);
      if (capacity < 1) {
        newPage();
        tableHeader();
        capacity = Math.floor((bottom - y - padding * 2) / lineHeight);
      }
      const chunk = Math.min(count - offset, capacity);
      const rowHeight = chunk * lineHeight + padding * 2;
      let x = margin;
      cells.forEach((cell, index) => {
        cellBox(x, y, columns[index], rowHeight, index === 0 ? colors.day : [255, 255, 255]);
        font(index === 0 ? dayFontSize : fontSize);
        const content = index === 0 && offset > 0
          ? wrap(`${row.dia} (cont.)`, columns[0] - padding * 2)
          : cell.slice(offset, offset + chunk);
        const safeContent = content.slice(0, chunk);
        if (safeContent.length) {
          doc.text(safeContent, x + padding, y + padding + baseline, {
            lineHeightFactor: lineHeight / (doc.getFontSize() / doc.internal.scaleFactor),
          });
        }
        x += columns[index];
      });
      y += rowHeight;
      pageHasRows = true;
      offset += chunk;
      if (offset < count) {
        newPage();
        tableHeader();
      }
    }
  }

  y += 4.5;
  if (y + lineHeight > bottom) newPage();
  font(fontSize, "bold");
  const noteLabel = "Indicaciones:";
  const labelWidth = doc.getTextWidth(noteLabel) + 1;
  font();
  // Indent only the first note line so its text begins next to the bold label.
  // Later lines use the full width; explicit paragraph breaks stay intact.
  const paragraphs = String(model.indicaciones || "—").replace(/\r\n?/gu, "\n").split("\n");
  const noteLines = paragraphs.flatMap((paragraph, index) => doc.splitTextToSize(paragraph, availableWidth, index === 0 ? { textIndent: labelWidth } : undefined));
  noteLines.forEach((row, index) => {
    if (y + lineHeight > bottom) {
      newPage();
      font(fontSize, "bold");
      doc.text("Indicaciones (continuación):", margin, y + baseline);
      y += lineHeight;
    }
    if (index === 0) {
      font(fontSize, "bold");
      doc.text(noteLabel, margin, y + baseline);
    }
    font();
    if (row) doc.text(row, margin + (index === 0 ? labelWidth : 0), y + baseline);
    y += lineHeight;
  });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    rule(height - 12);
    font(6.5, "normal", colors.muted);
    doc.text(model.brand, margin, height - 7);
    doc.text("Uso personal y confidencial", width / 2, height - 7, { align: "center" });
    doc.text(`Página ${page} de ${pages}`, width - margin, height - 7, { align: "right" });
  }
  doc.setProperties({ title: `${model.title} - ${model.paciente}`, subject: "Plan alimentario individual", author: model.brand, creator: model.brand });
  return doc;
}
