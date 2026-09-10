import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { CATEGORY_ICONS } from "../utils/categoryMeta";
import styles from "../styles/categoryTabs.module.scss";

function CategoryTabLabel({ slug, label }) {
  const Icon = CATEGORY_ICONS[slug];

  return (
    <>
      {Icon ? (
        <span className={styles.tabIcon} aria-hidden="true">
          <Icon />
        </span>
      ) : null}
      {label}
    </>
  );
}

function readGap(element) {
  const styles = getComputedStyle(element);
  return Number.parseFloat(styles.columnGap || styles.gap) || 12;
}

function countFittingTabs(widths, available, gap, moreWidth) {
  const allWidth = widths.reduce(
    (total, width, index) => total + width + (index > 0 ? gap : 0),
    0
  );
  if (allWidth <= available) return widths.length;

  let count = widths.length;
  while (count > 1) {
    let row = moreWidth;
    for (let index = 0; index < count; index += 1) {
      row += widths[index] + gap;
    }
    if (row <= available) break;
    count -= 1;
  }

  return Math.max(1, count);
}

/**
 * @param {{
 *   categories: Array<{ slug: string, label: string }>,
 *   activeSlug: string,
 *   expanded: boolean,
 *   onSelect: (slug: string) => void,
 *   onToggleExpanded: () => void,
 *   onVisibleCountChange?: (count: number) => void,
 * }} props
 */
function CategoryTabs({
  categories,
  activeSlug,
  expanded,
  onSelect,
  onToggleExpanded,
  onVisibleCountChange,
}) {
  const wrapRef = useRef(null);
  const measureRef = useRef(null);
  const [fitCount, setFitCount] = useState(categories.length);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const measure = measureRef.current;
    if (!wrap || !measure) return undefined;

    const updateFitCount = () => {
      const available = wrap.clientWidth;
      const tabEls = [...measure.querySelectorAll("[data-measure-tab]")];
      const moreEl = measure.querySelector("[data-measure-more]");
      if (available <= 0 || !tabEls.length || !moreEl) return;

      const widths = tabEls.map((element) => element.getBoundingClientRect().width);
      const nextCount = countFittingTabs(
        widths,
        available,
        readGap(measure),
        moreEl.getBoundingClientRect().width
      );
      setFitCount(nextCount);
    };

    updateFitCount();
    const observer = new ResizeObserver(updateFitCount);
    observer.observe(wrap);
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(updateFitCount);
    }

    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    onVisibleCountChange?.(fitCount);
  }, [fitCount, onVisibleCountChange]);

  const allFit = fitCount >= categories.length;
  const visible = expanded || allFit ? categories : categories.slice(0, fitCount);
  const showToggle = expanded || !allFit;

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <div ref={measureRef} className={styles.measure} aria-hidden="true">
        {categories.map((category) => (
          <span
            key={category.slug}
            data-measure-tab=""
            className={styles.tab}
          >
            <CategoryTabLabel slug={category.slug} label={category.label} />
          </span>
        ))}
        <span
          data-measure-more=""
          className={`${styles.tab} ${styles.tabMore}`}
        >
          More
        </span>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="App categories">
        {visible.map((category) => {
          const isActive = category.slug === activeSlug;
          return (
            <button
              key={category.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => onSelect(category.slug)}
            >
              <CategoryTabLabel slug={category.slug} label={category.label} />
            </button>
          );
        })}
        {showToggle ? (
          <button
            type="button"
            className={`${styles.tab} ${styles.tabMore}`}
            onClick={onToggleExpanded}
            aria-expanded={expanded}
          >
            {expanded ? "Less" : "More"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default CategoryTabs;
