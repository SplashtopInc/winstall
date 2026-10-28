import { useEffect, useId, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import styles from "../styles/versionSelect.module.scss";

/**
 * Custom version menu. The closed label for an empty value is "{latest}(latest)".
 *
 * @param {{
 *   id?: string,
 *   labelId?: string,
 *   value: string,
 *   latestVersion?: string,
 *   versions: Array<{ version: string }>,
 *   onChange: (value: string) => void,
 *   disabled?: boolean,
 * }} props
 */
export default function VersionSelect({
  id = "app-version-select",
  labelId,
  value,
  latestVersion,
  versions,
  onChange,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);
  const focusOnOpenRef = useRef(false);
  const valueId = useId();

  const options = [
    ...(latestVersion
      ? [{ value: "", label: `${latestVersion}(latest)` }]
      : []),
    ...versions.map((entry) => ({
      value: entry.version,
      label: entry.version,
    })),
  ];

  const selected =
    options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !focusOnOpenRef.current) return;
    focusOnOpenRef.current = false;
    const current = wrapRef.current?.querySelector("[aria-selected='true']");
    current?.focus();
    current?.scrollIntoView({ block: "nearest" });
  }, [isOpen]);

  const optionButtons = () => [
    ...(wrapRef.current?.querySelectorAll("[role='option']") || []),
  ];

  const focusOption = (button) => {
    button?.focus();
    button?.scrollIntoView({ block: "nearest" });
  };

  const focusSelectedOption = () => {
    const buttons = optionButtons();
    const selectedButton =
      buttons.find((button) => button.getAttribute("aria-selected") === "true") ||
      buttons[0];
    focusOption(selectedButton);
  };

  const moveOption = (step) => {
    const buttons = optionButtons();
    if (!buttons.length) return;
    const index = buttons.indexOf(document.activeElement);
    if (index < 0) {
      focusSelectedOption();
      return;
    }
    focusOption(buttons[(index + step + buttons.length) % buttons.length]);
  };

  const handleTriggerKeyDown = (event) => {
    if (disabled) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        focusOnOpenRef.current = true;
        setIsOpen(true);
        return;
      }
      moveOption(1);
    } else if ((event.key === "Enter" || event.key === " ") && !isOpen) {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const handleMenuKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveOption(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveOption(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(wrapRef.current?.querySelector("[role='option']"));
    } else if (event.key === "End") {
      event.preventDefault();
      const buttons = wrapRef.current?.querySelectorAll("[role='option']");
      focusOption(buttons?.[buttons.length - 1]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      wrapRef.current?.querySelector("button")?.focus();
    }
  };

  const handlePick = (next) => {
    setIsOpen(false);
    onChange?.(next);
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        id={id}
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelId ? `${labelId} ${valueId}` : undefined}
        aria-label={labelId ? undefined : "Select app version"}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((open) => !open);
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={styles.value} id={valueId}>
          {selected?.label || "Latest"}
        </span>
        <FiChevronDown
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <ul
          className={styles.menu}
          role="listbox"
          aria-label="Select app version"
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((option) => {
            const isActive = option.value === (selected?.value ?? "");
            return (
              <li key={option.value || "latest"} role="presentation">
                <button
                  type="button"
                  role="option"
                  data-value={option.value}
                  aria-selected={isActive}
                  className={`${styles.option} ${isActive ? styles.optionActive : ""}`}
                  onClick={() => handlePick(option.value)}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
