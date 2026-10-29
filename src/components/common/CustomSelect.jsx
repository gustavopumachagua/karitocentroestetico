import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import { getSelectMenuPosition } from "../../utils/selectMenuPosition";

const accentStyles = {
  cyan: {
    focus: "focus:border-[var(--accent)] focus:ring-[var(--accent-soft)]",
    hover: "hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
    active: "bg-[var(--accent-soft)] text-[var(--text-primary)]",
    icon: "text-[var(--accent)]",
  },
  emerald: {
    focus: "focus:border-[var(--accent)] focus:ring-[var(--accent-soft)]",
    hover: "hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
    active: "bg-[var(--accent-soft)] text-[var(--text-primary)]",
    icon: "text-[var(--accent)]",
  },
  violet: {
    focus: "focus:border-[var(--accent)] focus:ring-[var(--accent-soft)]",
    hover: "hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
    active: "bg-[var(--accent-soft)] text-[var(--text-primary)]",
    icon: "text-[var(--accent)]",
  },
  indigo: {
    focus: "focus:border-[var(--accent)] focus:ring-[var(--accent-soft)]",
    hover: "hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
    active: "bg-[var(--accent-soft)] text-[var(--text-primary)]",
    icon: "text-[var(--accent)]",
  },
};

const sizeStyles = {
  sm: "min-h-11 px-3 py-2 text-sm",
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
  preventParentOutsideClick = false,
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

  const updateMenuPosition = useCallback(() => {
    const button = buttonRef.current;
    const menu = menuRef.current;
    if (!button || !menu || typeof window === "undefined") return;

    const nextStyle = getSelectMenuPosition({
      rect: button.getBoundingClientRect(),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      contentHeight: menu.scrollHeight + menu.offsetHeight - menu.clientHeight,
    });
    setMenuStyle((current) =>
      Object.keys(nextStyle).length === Object.keys(current).length &&
      Object.entries(nextStyle).every(([key, position]) => current[key] === position)
        ? current
        : nextStyle
    );
  }, []);

  useLayoutEffect(() => {
    if (open) updateMenuPosition();
  }, [open, normalizedOptions, updateMenuPosition]);

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
  }, [open, normalizedOptions, value, updateMenuPosition]);

  // Some consumers (such as react-datepicker's custom time input) render this
  // menu in a portal while listening for outside clicks on `document`. Keep a
  // selection made in this portal from being mistaken for a click outside the
  // parent overlay. The option click itself still closes this select normally.
  useEffect(() => {
    if (!open || !preventParentOutsideClick) return undefined;

    const menu = menuRef.current;
    if (!menu) return undefined;

    const stopPropagation = (event) => event.stopPropagation();
    menu.addEventListener("mousedown", stopPropagation);
    menu.addEventListener("touchstart", stopPropagation);

    return () => {
      menu.removeEventListener("mousedown", stopPropagation);
      menu.removeEventListener("touchstart", stopPropagation);
    };
  }, [open, preventParentOutsideClick]);

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
            aria-labelledby={selectId}
            style={menuStyle}
            className={`react-datepicker-ignore-onclickoutside fixed z-[var(--z-select)] overflow-y-auto rounded-lg border border-[var(--line-strong)] bg-[var(--surface-raised)] p-1 shadow-[var(--shadow-float)] animate-fade-in ${menuClassName}`}
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
                    className={`react-datepicker-ignore-onclickoutside flex w-full items-center justify-between gap-3 min-h-11 rounded-md px-3 py-2.5 text-left text-sm transition ${
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
    <div className={`relative min-w-0 w-full ${className}`}>
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
        className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-md border border-[var(--line-strong)] bg-[var(--surface-input)] hover:border-slate-500 text-left outline-none transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          sizeStyles[size] || sizeStyles.md
        } ${styles.focus} ${buttonClassName}`}
      >
        <span
          className={`min-w-0 truncate ${
            isPlaceholder ? "text-slate-400" : "text-slate-200"
          }`}
        >
          {displayLabel}
        </span>
        <FaChevronDown
          className={`shrink-0 text-xs transition-transform ${
            open ? "rotate-180" : ""
          } ${disabled ? "text-slate-500" : "text-slate-400"}`}
        />
      </button>
      {menu}
    </div>
  );
}
