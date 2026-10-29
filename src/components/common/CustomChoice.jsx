import { FaCheck } from "react-icons/fa";

const accentStyles = {
  cyan: {
    checked: "border-[var(--accent)] bg-[var(--accent)] text-[var(--surface-canvas)]",
    hover: "group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-soft)]",
    dot: "bg-[var(--surface-canvas)]",
  },
  violet: {
    checked:
      "border-[var(--accent)] bg-[var(--accent)] text-[var(--surface-canvas)]",
    hover: "group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-soft)]",
    dot: "bg-[var(--surface-canvas)]",
  },
};

export default function CustomChoice({
  type = "checkbox",
  name,
  value,
  checked,
  onChange,
  disabled = false,
  accent = "cyan",
  ariaLabel,
}) {
  const styles = accentStyles[accent] || accentStyles.cyan;
  const isRadio = type === "radio";

  return (
    <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 items-center justify-center border transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-indigo-300 ${
          isRadio ? "rounded-full" : "rounded-sm"
        } ${
          checked
            ? styles.checked
            : `border-[var(--line-strong)] bg-[var(--surface-input)] ${styles.hover}`
        } ${disabled ? "opacity-55" : ""}`}
      >
        {checked &&
          (isRadio ? (
            <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
          ) : (
            <FaCheck className="text-[0.65rem]" />
          ))}
      </span>
    </span>
  );
}
