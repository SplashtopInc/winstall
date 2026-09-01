import popularAppsList from "../data/popularApps.json";
import categoryAppsList from "../data/categoryApps.json";
import localIconOverrides from "../data/localIconOverrides.json";
import { getIconBase } from "./runtimeConfig";

/** Prefer a raster URL suitable for canvas sampling (PNG when available). */
export function resolveAppIconSampleUrl(app) {
  if (!app) return null;

  const localApp =
    Object.values(popularAppsList).find((item) => item._id === app._id) ||
    Object.values(categoryAppsList).flat().find((item) => item._id === app._id);
  if (localApp?.img) {
    return `/assets/apps/fallback/${String(localApp.img).replace("webp", "png")}`;
  }

  const overrideImg = localIconOverrides[app._id];
  if (overrideImg) {
    return `/assets/apps/fallback/${String(overrideImg).replace("webp", "png")}`;
  }

  if (app.iconPng) return app.iconPng;
  if (app.iconUrl) return app.iconUrl;

  if (!app.icon) return null;
  if (String(app.icon).startsWith("http")) return app.icon;

  const iconName = String(app.icon).replace(/\.png$/i, "");
  const base = getIconBase();
  if (!base) return null;
  return `${base}/icons/${iconName}.png`;
}
