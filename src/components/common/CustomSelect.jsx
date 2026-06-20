import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaCheck, FaChevronDown } from "react-icons/fa";

const accentStyles = {
  cyan: {
    focus: "focus:border-cyan-400/60 focus:ring-cyan-400/15",
    hover: "hover:bg-cyan-400/10 hover:text-white",
    active: "bg-cyan-400/15 text-white",
    icon: "text-cyan-300",
  },
  emerald: {
    focus: "focus:border-emerald-400/60 focus:ring-emerald-400/15",
    hover: "hover:bg-emerald-400/10 hover:text-white",
    active: "bg-emerald-400/15 text-white",
    icon: "text-emerald-300",
  },
  violet: {
    focus: "focus:border-violet-400/60 focus:ring-violet-400/15",
    hover: "hover:bg-violet-400/10 hover:text-white",
    active: "bg-violet-400/15 text-white",
    icon: "text-violet-300",
  },
  indigo: {
    focus: "focus:border-indigo-400/60 focus:ring-indigo-400/15",
    hover: "hover:bg-indigo-400/10 hover:text-white",
    active: "bg-indigo-400/15 text-white",
    icon: "text-indigo-300",
  },
};

const sizeStyles = {
  sm: "min-h-10 px-3 py-2 text-sm",
  md: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-4 py-3 text-base",
};

function normalizeOption(option, index) {
  if (typeof option === "object" && option !== null) {
    const value = option.value ?? "";

    return {
      value,
      label: option.label ?? String(value),
      disabled: Boolean(option.disabled),
      key: option.key ?? `${value}-${index}`,
    };
  }

  return {
    value: option,
    label: String(option),
    disabled: false,
    key: `${option}-${index}`,
  };
}

function getNextEnabledIndex(options, startIndex, direction) {
  if (!options.length) return -1;

  let index = startIndex;

  for (let i = 0; i < options.length; i += 1) {
    index = (index + direction + options.length) % options.length;
    if (!options[index]?.disabled) return index;
  }

  return -1;
}

export default function CustomSelect({
  id,
  name,
  value = "",
  onChange,
  onValueChange,
  options = [],
  placeholder = "Seleccionar",
  disabled = false,
  accent = "cyan",
  size = "md",
  className = "",
  menuClassName = "",
  buttonClassName = "",
  ariaLabel,
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [menuStyle, setMenuStyle] = useState({});
  const styles = accentStyles[accent] || accentStyles.cyan;

  const normalizedOptions = useMemo(
    () => options.map((option, index) => normalizeOption(option, index)),
    [options]
  );

  const selectedOption = normalizedOptions.find(
    (option) => String(option.value) === String(value ?? "")
  );
  const displayLabel = selectedOption?.label || placeholder;
  const isPlaceholder =
    !selectedOption || value === "" || value === null || value === undefined;

  const updateMenuPosition = () => {
    const button = buttonRef.current;
    if (!button || typeof window === "undefined") return;

    const rect = button.getBoundingClientRect();
    const viewportPadding = 12;
    const gap = 8;
    const availableBelow = window.innerHeight - rect.bottom - viewportPadding;
    const availableAbove = rect.top - viewportPadding;
    const openUp = availableBelow < 220 && availableAbove > availableBelow;
    const availableSpace = openUp ? availableAbove : availableBelow;
    const maxHeight = Math.max(160, Math.min(288, availableSpace - gap));
    const width = Math.min(rect.width, window.innerWidth - viewportPadding * 2);
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      window.innerWidth - width - viewportPadding
    );

    setMenuStyle({
      left,
      top: openUp ? Math.max(viewportPadding, rect.top - maxHeight - gap) : rect.bottom + gap,
      width,
      maxHeight,
    });
  };

  useEffect(() => {
    if (!open) return undefined;

    const currentIndex = normalizedOptions.findIndex(
      (option) => String(option.value) === String(value ?? "")
    );
    setHighlightedIndex(
      currentIndex >= 0 && !normalizedOptions[currentIndex]?.disabled
        ? currentIndex
        : getNextEnabledIndex(normalizedOptions, -1, 1)
    );
    updateMenuPosition();

    const handlePointerDown = (event) => {
      if (
        buttonRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }

      setOpen(false);
    };

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open, normalizedOptions, value]);

  const handleSelect = (option) => {
    if (disabled || option.disabled) return;

    onChange?.({ target: { name, value: option.value } });
    onValueChange?.(option.value, option);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlightedIndex((current) =>
        getNextEnabledIndex(normalizedOptions, current, 1)
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlightedIndex((current) =>
        getNextEnabledIndex(normalizedOptions, current, -1)
      );
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }

      const option = normalizedOptions[highlightedIndex];
      if (option) handleSelect(option);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            id={`${selectId}-listbox`}
            role="listbox"
            style={menuStyle}
            className={`react-datepicker-ignore-onclickoutside fixed z-[10050] overflow-y-auto rounded-xl border border-slate-700/80 bg-slate-950/95 p-1 shadow-2xl shadow-black/40 backdrop-blur-xl animate-fade-in ${menuClassName}`}
          >
            {normalizedOptions.length > 0 ? (
              normalizedOptions.map((option, index) => {
                const selected =
                  String(option.value) === String(value ?? "");
                const highlighted = index === highlightedIndex;

                return (
                  <button
                    key={option.key}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={option.disabled}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(option)}
                    className={`react-datepicker-ignore-onclickoutside flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      selected || highlighted ? styles.active : "text-slate-300"
                    } ${styles.hover} ${
                      option.disabled
                        ? "cursor-not-allowed opacity-45"
                        : "cursor-pointer"
                    }`}
                  >
                    <span className="min-w-0 truncate">{option.label}</span>
                    {selected && (
                      <FaCheck className={`shrink-0 text-xs ${styles.icon}`} />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2.5 text-sm text-slate-400">
                Sin opciones disponibles
              </div>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <div className={`relative w-full ${className}`}>
      <button
        ref={buttonRef}
        id={selectId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${selectId}-listbox`}
        aria-label={ariaLabel || displayLabel}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-950/50 text-left outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          sizeStyles[size] || sizeStyles.md
        } ${styles.focus} ${buttonClassName}`}
      >
        <span
          className={`min-w-0 truncate ${
            isPlaceholder ? "text-slate-500" : "text-slate-200"
          }`}
        >
          {displayLabel}
        </span>
        <FaChevronDown
          className={`shrink-0 text-xs transition-transform ${
            open ? "rotate-180" : ""
          } ${disabled ? "text-slate-500" : styles.icon}`}
        />
      </button>
      {menu}
    </div>
  );
}
