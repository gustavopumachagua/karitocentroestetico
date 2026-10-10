const WIDTH_TOLERANCE = 1e-7;

/**
 * Lay out a clinical label and answer as one continuous rich-text paragraph.
 * Coordinates are relative to the field's left edge. Runs on the same line
 * share a baseline; the renderer owns page placement, fonts and pagination.
 *
 * `measure(text, kind)` must use the renderer's actual label/value fonts and
 * return a width in the same units as `width` and `lineHeight`.
 */
export function layoutPdfTextFlow({
  label,
  content,
  width,
  measure,
  lineHeight = 4.2,
}) {
  if (!Number.isFinite(width) || width <= 0) {
    throw new RangeError("El ancho del texto PDF debe ser positivo.");
  }
  if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
    throw new RangeError("El interlineado PDF debe ser positivo.");
  }
  if (typeof measure !== "function") {
    throw new TypeError("El texto PDF necesita una función de medición.");
  }

  const measureText = (text, kind) => {
    const measured = measure(text, kind);
    if (!Number.isFinite(measured) || measured < 0) {
      throw new RangeError("La medición del texto PDF no es válida.");
    }
    return measured;
  };

  const lines = [{ runs: [], width: 0 }];
  let pendingSpace = null;
  const currentLine = () => lines[lines.length - 1];
  const startLine = () => {
    lines.push({ runs: [], width: 0 });
    pendingSpace = null;
  };

  // Measure combined runs rather than adding isolated word widths. Font
  // kerning can make those two measurements differ, particularly in names.
  const withPieces = (pieces) => {
    const line = currentLine();
    const runs = line.runs.map((run) => ({ ...run }));
    let measuredWidth = line.width;

    pieces.forEach(({ text, kind }) => {
      if (!text) return;
      const last = runs[runs.length - 1];
      if (last?.kind === kind) {
        last.text += text;
        measuredWidth = last.x + measureText(last.text, kind);
      } else {
        runs.push({ text, kind, x: measuredWidth });
        measuredWidth += measureText(text, kind);
      }
    });

    return { runs, width: measuredWidth };
  };
  const fits = (line) => line.width <= width + WIDTH_TOLERANCE;
  const commit = (line) => {
    lines[lines.length - 1] = line;
    pendingSpace = null;
  };
  const spacePrefix = () =>
    pendingSpace && currentLine().runs.length ? [pendingSpace] : [];

  const addWord = (word, kind) => {
    const candidate = withPieces([...spacePrefix(), { text: word, kind }]);
    if (fits(candidate)) {
      commit(candidate);
      return;
    }

    // Ordinary words move intact to the next line. A long unbroken answer is
    // different: fill the remaining first line before splitting it, so its
    // first characters still follow the label's colon whenever space allows.
    if (measureText(word, kind) <= width + WIDTH_TOLERANCE) {
      startLine();
      commit(withPieces([{ text: word, kind }]));
      return;
    }

    const characters = Array.from(word);
    let offset = 0;
    while (offset < characters.length) {
      const prefix = spacePrefix();
      let low = 1;
      let high = characters.length - offset;
      let fittingLength = 0;
      let fittingLine = null;

      // Binary search limits font measurements for long pasted identifiers
      // while Array.from prevents splitting a Unicode surrogate pair.
      while (low <= high) {
        const length = Math.floor((low + high) / 2);
        const text = characters.slice(offset, offset + length).join("");
        const fragment = withPieces([...prefix, { text, kind }]);
        if (fits(fragment)) {
          fittingLength = length;
          fittingLine = fragment;
          low = length + 1;
        } else {
          high = length - 1;
        }
      }

      if (!fittingLength) {
        if (currentLine().runs.length) {
          startLine();
          continue;
        }
        // Even one glyph cannot fit: the renderer must choose another width
        // or font, rather than silently cutting or dropping clinical text.
        throw new RangeError("El ancho PDF no permite dibujar un carácter completo.");
      }

      commit(fittingLine);
      offset += fittingLength;
      if (offset < characters.length) startLine();
    }
  };

  const value = content === null || content === undefined ? "" : String(content);
  const parts = [
    { text: `${label ?? ""}: `, kind: "label" },
    { text: value.trim() ? value : "—", kind: "value" },
  ];

  parts.forEach(({ text, kind }) => {
    const tokens = text.match(/\r\n|\r|\n|[^\S\r\n]+|[^\s]+/gu) || [];
    tokens.forEach((token) => {
      if (/^[\r\n]/u.test(token)) {
        startLine();
      } else if (/^\s+$/u.test(token)) {
        pendingSpace = { text: " ", kind };
      } else {
        addWord(token, kind);
      }
    });
  });

  return { lines, lineHeight, height: lines.length * lineHeight };
}
