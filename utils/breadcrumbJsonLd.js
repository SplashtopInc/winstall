import { buildSiteUrl } from "./helpers.js";
import {
  CATEGORY_LABELS,
  categoryPagePath,
  detailShelfSlugs,
  isShelfSlug,
} from "./categoryShelfPath.js";

const SCHEMA_CONTEXT = "https://schema.org";
const HOME_CRUMB = Object.freeze({ name: "winstall", path: "/" });
const APPS_CRUMB = Object.freeze({ name: "Apps", path: "/category" });
const PACKS_CRUMB = Object.freeze({ name: "Packs", path: "/packs" });

function trimmed(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isAbsoluteHttpUrl(value) {
  return /^https?:\/\//i.test(value);
}

/**
 * schema.org BreadcrumbList from ordered { name, path } crumbs.
 * Returns null when any name is empty or any path cannot become an absolute URL.
 */
export function buildBreadcrumbJsonLd(crumbs) {
  if (!Array.isArray(crumbs) || crumbs.length === 0) return null;

  const itemListElement = [];
  for (let index = 0; index < crumbs.length; index += 1) {
    const crumb = crumbs[index];
    const name = trimmed(crumb?.name);
    const path = trimmed(crumb?.path);
    if (!name || !path) return null;

    const item = buildSiteUrl(path);
    if (!isAbsoluteHttpUrl(item)) return null;

    itemListElement.push({
      "@type": "ListItem",
      position: index + 1,
      name,
      item,
    });
  }

  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

/** /category (all) or /category/<slug>. Unknown slugs are treated as all. */
export function buildCategoryBreadcrumbJsonLd(slug) {
  const crumbs = [HOME_CRUMB, APPS_CRUMB];
  if (isShelfSlug(slug)) {
    crumbs.push({
      name: CATEGORY_LABELS[slug],
      path: categoryPagePath(slug),
    });
  }
  return buildBreadcrumbJsonLd(crumbs);
}

/**
 * One trail for a found app: winstall → Apps → first shelf → app.
 * Returns null when the app has no known shelf, or lacks a name or id.
 */
export function buildAppBreadcrumbJsonLd(app) {
  if (!app || typeof app !== "object") return null;

  const name = trimmed(app.name);
  const id = trimmed(app._id);
  if (!name || !id) return null;

  const slug = detailShelfSlugs(app.categories)[0];
  if (!slug) return null;

  return buildBreadcrumbJsonLd([
    HOME_CRUMB,
    APPS_CRUMB,
    { name: CATEGORY_LABELS[slug], path: categoryPagePath(slug) },
    { name, path: `/apps/${id}` },
  ]);
}

/** /packs list: winstall → Packs. */
export function buildPackListBreadcrumbJsonLd() {
  return buildBreadcrumbJsonLd([HOME_CRUMB, PACKS_CRUMB]);
}

/**
 * Loaded pack detail: winstall → Packs → pack name.
 * Returns null when the name or id is missing.
 */
export function buildPackDetailBreadcrumbJsonLd(pack) {
  if (!pack || typeof pack !== "object") return null;

  const name = trimmed(pack.name);
  const id = trimmed(pack._id);
  if (!name || !id) return null;

  return buildBreadcrumbJsonLd([
    HOME_CRUMB,
    PACKS_CRUMB,
    { name, path: `/packs/${id}` },
  ]);
}

/** JSON for an ld+json script. Escapes `<` so a name cannot close the tag. */
export function serializeBreadcrumbJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
