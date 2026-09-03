import fetchWinstallAPI from "./fetchWinstallAPI";
import { getIconBase } from "./runtimeConfig";

/**
 * Optional slug → API category label map.
 * Leave empty when stored categories use the same slug as the Web tab key.
 * If production stores display labels (e.g. "Web Browser"), set entries here
 * without changing the URL `?category=` slug.
 */
const CATEGORY_API_LABEL_BY_SLUG = Object.freeze({});

function resolveCategoryId(slug) {
  return CATEGORY_API_LABEL_BY_SLUG[slug] || slug;
}

function normalizeCategoryEnvelope(payload) {
  if (!payload) {
    return { items: [], total: 0, offset: 0, limit: 0 };
  }

  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length,
      offset: 0,
      limit: payload.length,
    };
  }

  const items = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.apps)
        ? payload.apps
        : [];

  return {
    items,
    total: typeof payload.total === "number" ? payload.total : items.length,
    offset: typeof payload.offset === "number" ? payload.offset : 0,
    limit: typeof payload.limit === "number" ? payload.limit : items.length,
  };
}

function applyIconBase(apps) {
  const base = getIconBase();
  if (!base || !apps?.length) return apps || [];

  return apps.map((app) => {
    if (app.icon && !app.icon.startsWith("http") && !app.iconUrl) {
      const iconName = app.icon.replace(".png", "");
      return {
        ...app,
        iconUrl: `${base}/icons/next/${iconName}.webp`,
        iconPng: `${base}/icons/${iconName}.png`,
      };
    }
    return app;
  });
}

/**
 * @param {{ slug: string, offset?: number, limit?: number }} params
 */
export async function fetchCategoryApps({ slug, offset = 0, limit = 56 }) {
  const categoryId = encodeURIComponent(resolveCategoryId(slug));
  const path = `/apps/categories/${categoryId}?offset=${offset}&limit=${limit}`;
  const { response, error, status } = await fetchWinstallAPI(path);

  if (error) {
    return {
      items: [],
      total: 0,
      offset,
      limit,
      error,
      status,
    };
  }

  const normalized = normalizeCategoryEnvelope(response);
  return {
    ...normalized,
    items: applyIconBase(normalized.items),
    error: null,
    status,
  };
}
