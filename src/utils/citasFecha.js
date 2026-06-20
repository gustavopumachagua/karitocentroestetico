const TIME_ZONE_LIMA = "America/Lima";
const UTC_OFFSET_LIMA = "-05:00";

const LOCAL_DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
const TIME_ZONE_SUFFIX_REGEX = /(Z|[+-]\d{2}:\d{2})$/i;

function isValidDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

function normalizeLocalDateTime(value) {
  if (!LOCAL_DATE_TIME_REGEX.test(value)) return value;
  return value.length === 16 ? `${value}:00` : value;
}

export function parseFechaCita(fecha) {
  if (!fecha) return null;

  if (fecha instanceof Date) {
    return isValidDate(fecha) ? fecha : null;
  }

  if (typeof fecha !== "string") {
    const parsedDate = new Date(fecha);
    return isValidDate(parsedDate) ? parsedDate : null;
  }

  const normalizedValue = fecha.trim();
  if (!normalizedValue) return null;

  if (
    LOCAL_DATE_TIME_REGEX.test(normalizedValue) &&
    !TIME_ZONE_SUFFIX_REGEX.test(normalizedValue)
  ) {
    const parsedLocalDate = new Date(
      `${normalizeLocalDateTime(normalizedValue)}${UTC_OFFSET_LIMA}`
    );
    return isValidDate(parsedLocalDate) ? parsedLocalDate : null;
  }

  const parsedDate = new Date(normalizedValue);
  return isValidDate(parsedDate) ? parsedDate : null;
}

export function convertirFechaCitaAISOString(fecha) {
  const parsedDate = parseFechaCita(fecha);
  return parsedDate ? parsedDate.toISOString() : fecha;
}

export function formatearFechaCitaParaInput(fecha) {
  const parsedDate = parseFechaCita(fecha);

  if (!parsedDate) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE_LIMA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(parsedDate)
    .reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function formatearFechaCita(fecha) {
  const parsedDate = parseFechaCita(fecha);

  if (!parsedDate) return "Fecha invalida";

  return new Intl.DateTimeFormat("es-PE", {
    timeZone: TIME_ZONE_LIMA,
    dateStyle: "short",
    timeStyle: "short",
    hour12: false,
  }).format(parsedDate);
}

export function obtenerTimestampCita(fecha) {
  const parsedDate = parseFechaCita(fecha);
  return parsedDate ? parsedDate.getTime() : 0;
}
