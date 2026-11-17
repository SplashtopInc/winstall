import { detailShelfSlugs } from "./categoryShelfPath.js";
import { buildSiteUrl } from "./helpers.js";
import { getIconBase } from "./runtimeConfig.js";

/** Shelf slug → schema.org application type. Unlisted shelves stay unmapped. */
const APPLICATION_CATEGORY_BY_SLUG = Object.freeze({
  browser: "BrowserApplication",
  development: "DeveloperApplication",
  communication: "CommunicationApplication",
  utilities: "UtilitiesApplication",
  security: "SecurityApplication",
  entertainment: "EntertainmentApplication",
  game: "GameApplication",
});

const WINSTALL_REF = "winstall";

function trimmed(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isAbsoluteHttpUrl(value) {
  return /^https?:\/\//i.test(value);
}

/**
 * Publisher homepage without the site's tracking query.
 * Returns "" when the value is missing or not an absolute http(s) URL.
 */
function publisherHomepage(value) {
  const raw = trimmed(value);
  if (!raw || !isAbsoluteHttpUrl(raw)) return "";

  try {
    const url = new URL(raw);
    if (url.searchParams.get("ref") === WINSTALL_REF) {
      url.searchParams.delete("ref");
    }
    return url.toString();
  } catch {
    return raw.includes("ref=winstall") ? "" : raw;
  }
}

function applicationCategory(categories) {
  const slugs = detailShelfSlugs(categories);
  for (const slug of slugs) {
    const mapped = APPLICATION_CATEGORY_BY_SLUG[slug];
    if (mapped) return mapped;
  }
  return "";
}

function iconUrl(icon) {
  const value = trimmed(icon);
  if (!value) return "";
  if (isAbsoluteHttpUrl(value)) return value;

  const base = trimmed(getIconBase()).replace(/\/+$/, "");
  if (!base || !isAbsoluteHttpUrl(base)) return "";

  const iconName = value.replace(/\.png$/i, "");
  return `${base}/icons/next/${iconName}.webp`;
}

function organization(name) {
  return { "@type": "Organization", name };
}

/**
 * schema.org SoftwareApplication for a found app detail page.
 * Returns null when the name or the canonical absolute URL is unavailable.
 * Never includes offers, ratings, reviews, or downloadUrl.
 */
export function buildAppJsonLd(app) {
  if (!app || typeof app !== "object") return null;

  const name = trimmed(app.name);
  const id = trimmed(app._id);
  if (!name || !id) return null;

  const url = buildSiteUrl(`/apps/${id}`);
  if (!isAbsoluteHttpUrl(url)) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    url,
    operatingSystem: "Windows",
    identifier: id,
  };

  const description = trimmed(app.fullDesc) || trimmed(app.desc);
  if (description) data.description = description;

  const softwareVersion = trimmed(app.latestVersion);
  if (softwareVersion) data.softwareVersion = softwareVersion;

  const publisherName = trimmed(app.publisher);
  if (publisherName) {
    data.author = organization(publisherName);
    data.publisher = organization(publisherName);
  }

  const sameAs = publisherHomepage(app.homepage);
  if (sameAs) data.sameAs = sameAs;

  const softwareRequirements = trimmed(app.minOS);
  if (softwareRequirements) data.softwareRequirements = softwareRequirements;

  const license = trimmed(app.licenseUrl) || trimmed(app.license);
  if (license) data.license = license;

  const dateModified = trimmed(app.updatedAt);
  if (dateModified) data.dateModified = dateModified;

  const image = iconUrl(app.icon);
  if (image) data.image = image;

  const category = applicationCategory(app.categories);
  if (category) data.applicationCategory = category;

  return data;
}

/** JSON for an ld+json script. Escapes `<` so a description cannot close the tag. */
export function serializeAppJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
