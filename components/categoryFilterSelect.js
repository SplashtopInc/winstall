import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import styles from "../styles/categoryFilterSelect.module.scss";

/**
 * @param {{
 *   categories: Array<{ slug: string, label: string }>,
 *   activeSlug: string,
 *   onSelect: (slug: string) => void,
 *   label?: string,
 * }} props
 */
export default function CategoryFilterSelect({
  categories,
  activeSlug,
  onSelect,
  label = "Filter by",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  const selected =
    categories.find((category) => category.slug === activeSlug) || categories[0];

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

  const handlePick = (slug) => {
    setIsOpen(false);
    onSelect?.(slug);
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <span className={styles.floatingLabel} id="category-filter-label">
        {label}
      </span>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="category-filter-label"
      >
        <span className={styles.value}>{selected?.label || "All"}</span>
        <FiChevronDown
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <ul className={styles.menu} role="listbox" aria-label={label}>
          {categories.map((category) => {
            const isActive = category.slug === activeSlug;
            return (
              <li key={category.slug} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`${styles.option} ${isActive ? styles.optionActive : ""}`}
                  onClick={() => handlePick(category.slug)}
                >
                  {category.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
