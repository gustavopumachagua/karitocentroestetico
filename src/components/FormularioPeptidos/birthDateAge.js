/**
 * Calendar-only helpers for the clinical history birth-date and age fields.
 *
 * Dates from an `<input type="date">` are intentionally parsed as calendar
 * values instead of `new Date("YYYY-MM-DD")`: the latter is UTC based and can
 * make a birth date move one day in time zones west of UTC.
 */
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const toCalendarToday = (now = new Date()) => ({
  year: now.getFullYear(),
  monthIndex: now.getMonth(),
  day: now.getDate(),
});

const daysInMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0).getDate();

const formatCalendarDate = ({ year, monthIndex, day }) =>
  [
    String(year).padStart(4, "0"),
    String(monthIndex + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");

export function parseBirthDate(value) {
  const match = DATE_PATTERN.exec(String(value ?? "").trim());
  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);

  if (
    monthIndex < 0 ||
    monthIndex > 11 ||
    day < 1 ||
    day > daysInMonth(year, monthIndex)
  ) {
    return null;
  }

  return { year, monthIndex, day };
}

export function calculateAgeFromBirthDate(value, now = new Date()) {
  const birthDate = parseBirthDate(value);
  if (!birthDate) return null;

  const today = toCalendarToday(now);
  if (
    birthDate.year > today.year ||
    (birthDate.year === today.year &&
      (birthDate.monthIndex > today.monthIndex ||
        (birthDate.monthIndex === today.monthIndex && birthDate.day > today.day)))
  ) {
    return null;
  }

  let age = today.year - birthDate.year;
  const birthdayHasNotOccurred =
    birthDate.monthIndex > today.monthIndex ||
    (birthDate.monthIndex === today.monthIndex && birthDate.day > today.day);

  if (birthdayHasNotOccurred) age -= 1;
  return age;
}

export function isAdultAge(value, { min = 18, max = 130 } = {}) {
  const text = String(value ?? "").trim();
  if (!/^\d+$/.test(text)) return false;

  const age = Number(text);
  return age >= min && age <= max;
}

export function isAdultBirthDate(value, now = new Date()) {
  const age = calculateAgeFromBirthDate(value, now);
  return age !== null && age >= 18;
}

/**
 * Checks an existing draft as well as user input. This is needed because old
 * drafts can contain independently saved values from before the fields were
 * synchronized in the UI.
 */
export function isAgeConsistentWithBirthDate(
  birthDateValue,
  ageValue,
  now = new Date(),
) {
  if (!isAdultAge(ageValue)) return false;

  const calculatedAge = calculateAgeFromBirthDate(birthDateValue, now);
  return calculatedAge !== null && calculatedAge === Number(ageValue);
}

export function getLatestAdultBirthDate(now = new Date()) {
  const today = toCalendarToday(now);
  return formatCalendarDate({
    year: today.year - 18,
    monthIndex: today.monthIndex,
    day: today.day,
  });
}

const buildCalendarDate = (year, monthIndex, day) => ({
  year,
  monthIndex,
  day: Math.min(day, daysInMonth(year, monthIndex)),
});

/**
 * Produces a valid birth date for a manually entered age. Month and day from
 * the current birth date are preserved whenever possible. If the user has not
 * provided a date yet, today's month/day is used as a neutral editable value.
 *
 * February 29 deserves a small exception: when the target year is leap and
 * the selected age would otherwise be one year short on February 28, February
 * 28 is used so the resulting visible date and age remain coherent.
 */
export function getBirthDateForAge(
  ageValue,
  currentBirthDate,
  now = new Date(),
) {
  if (!isAdultAge(ageValue)) return "";

  const age = Number(ageValue);
  const today = toCalendarToday(now);
  const currentDate = parseBirthDate(currentBirthDate);
  const monthIndex = currentDate?.monthIndex ?? today.monthIndex;
  const day = currentDate?.day ?? today.day;
  const targetYear = today.year - age;

  const candidates = [
    buildCalendarDate(targetYear, monthIndex, day),
    buildCalendarDate(targetYear - 1, monthIndex, day),
  ];

  // A clinician cannot retain 29 February in a non-leap year. When this is
  // the only reason the exact age would not match, retain the month and use
  // the closest valid day instead.
  if (monthIndex === 1 && day === 29) {
    candidates.push(buildCalendarDate(targetYear, monthIndex, 28));
    candidates.push(buildCalendarDate(targetYear - 1, monthIndex, 28));
  }

  const matchingDate = candidates.find(
    (candidate) =>
      calculateAgeFromBirthDate(formatCalendarDate(candidate), now) === age,
  );

  return formatCalendarDate(matchingDate || candidates[0]);
}
