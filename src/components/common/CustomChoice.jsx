import { FaCheck } from "react-icons/fa";

const accentStyles = {
  cyan: {
    checked: "border-indigo-400/70 bg-indigo-400/18 text-indigo-100 shadow-indigo-500/15",
    hover: "group-hover:border-indigo-400/45 group-hover:bg-indigo-400/10",
    dot: "bg-indigo-200",
  },
  violet: {
    checked:
      "border-indigo-400/70 bg-indigo-400/18 text-indigo-100 shadow-indigo-500/15",
    hover: "group-hover:border-indigo-400/45 group-hover:bg-indigo-400/10",
    dot: "bg-indigo-200",
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
          isRadio ? "rounded-full" : "rounded-md"
        } ${
          checked
            ? styles.checked
            : `border-slate-600 bg-slate-950/65 ${styles.hover}`
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
