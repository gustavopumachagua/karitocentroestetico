import { FaCheck } from "react-icons/fa";

const accentStyles = {
  cyan: {
    checked: "border-cyan-400/70 bg-cyan-400/18 text-cyan-100 shadow-cyan-500/15",
    hover: "group-hover:border-cyan-400/45 group-hover:bg-cyan-400/10",
    dot: "bg-cyan-200",
  },
  violet: {
    checked:
      "border-violet-400/70 bg-violet-400/18 text-violet-100 shadow-violet-500/15",
    hover: "group-hover:border-violet-400/45 group-hover:bg-violet-400/10",
    dot: "bg-violet-200",
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
        className={`flex h-5 w-5 items-center justify-center border transition ${
          isRadio ? "rounded-full" : "rounded-md"
        } ${
          checked
            ? `${styles.checked} shadow-lg`
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
