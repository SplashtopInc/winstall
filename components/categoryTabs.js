import styles from "../styles/categoryTabs.module.scss";

export const VISIBLE_TAB_COUNT = 6;

/**
 * @param {{
 *   categories: Array<{ slug: string, label: string }>,
 *   activeSlug: string,
 *   expanded: boolean,
 *   onSelect: (slug: string) => void,
 *   onToggleExpanded: () => void,
 * }} props
 */
function CategoryTabs({
  categories,
  activeSlug,
  expanded,
  onSelect,
  onToggleExpanded,
}) {
  const visible = expanded
    ? categories
    : categories.slice(0, VISIBLE_TAB_COUNT);

  return (
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
            {category.label}
          </button>
        );
      })}
      <button
        type="button"
        className={`${styles.tab} ${styles.tabMore}`}
        onClick={onToggleExpanded}
        aria-expanded={expanded}
      >
        {expanded ? "Less" : "More"}
      </button>
    </div>
  );
}

export default CategoryTabs;
