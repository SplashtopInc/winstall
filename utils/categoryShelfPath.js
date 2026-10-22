export const SHELF_SLUGS = Object.freeze([
  "browser",
  "development",
  "documents",
  "communication",
  "utilities",
  "security",
  "productivity",
  "cloud_storage",
  "collaboration",
  "entertainment",
  "photo",
  "game",
  "screenshots",
  "runtimes",
]);

export const CATEGORY_LABELS = Object.freeze({
  all: "All",
  browser: "Browsers",
  development: "Developer Tools",
  documents: "Office",
  communication: "Communication",
  utilities: "Utilities",
  security: "Security",
  productivity: "Productivity",
  cloud_storage: "Cloud Storage",
  collaboration: "Collaboration",
  entertainment: "Entertainment",
  photo: "Photos",
  game: "Games",
  screenshots: "Screenshots",
  runtimes: "Runtimes",
});

export const ALL_CATEGORY_PATH = "/category";
export const ALL_CATEGORY_TITLE = "Apps by Category - winstall";

export function isShelfSlug(slug) {
  return typeof slug === "string" && SHELF_SLUGS.includes(slug);
}

export function categoryPagePath(slug) {
  if (!isShelfSlug(slug)) return ALL_CATEGORY_PATH;
  return `/category/${slug}`;
}

export function categoryDocumentTitle(slug) {
  if (!isShelfSlug(slug)) return ALL_CATEGORY_TITLE;
  return `${CATEGORY_LABELS[slug]} - winstall`;
}

/**
 * Path for a legacy `?category=` document request.
 * Returns null when the value is not a known shelf or `all`.
 * Next.js config redirects keep the original query, so the caller deletes it.
 */
export function categoryQueryRedirectPath(categoryValue) {
  if (categoryValue === "all") return ALL_CATEGORY_PATH;
  if (isShelfSlug(categoryValue)) return categoryPagePath(categoryValue);
  return null;
}

/** Shelf slugs to link from an app detail page, in shelf order. */
export function detailShelfSlugs(categories) {
  if (!Array.isArray(categories)) return [];
  const present = new Set();
  for (const slug of categories) {
    if (isShelfSlug(slug)) present.add(slug);
  }
  return SHELF_SLUGS.filter((slug) => present.has(slug));
}

export function categoryBrowseLinkLabel(slug) {
  if (!isShelfSlug(slug)) return "";
  return `Browse ${CATEGORY_LABELS[slug]} apps`;
}
