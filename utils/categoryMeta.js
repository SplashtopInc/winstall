import {
  FiCheckSquare,
  FiCloud,
  FiCode,
  FiCpu,
  FiCrop,
  FiFileText,
  FiFilm,
  FiGlobe,
  FiGrid,
  FiImage,
  FiMessageCircle,
  FiShield,
  FiTarget,
  FiTool,
  FiUsers,
} from "react-icons/fi";

import { CATEGORY_LABELS, SHELF_SLUGS } from "./categoryShelfPath.js";

export { CATEGORY_LABELS };

export const CATEGORY_SLUGS = Object.freeze(["all", ...SHELF_SLUGS]);

export const CATEGORY_ICONS = Object.freeze({
  all: FiGrid,
  browser: FiGlobe,
  development: FiCode,
  documents: FiFileText,
  communication: FiMessageCircle,
  utilities: FiTool,
  security: FiShield,
  productivity: FiCheckSquare,
  cloud_storage: FiCloud,
  collaboration: FiUsers,
  entertainment: FiFilm,
  photo: FiImage,
  game: FiTarget,
  screenshots: FiCrop,
  runtimes: FiCpu,
});

export const TOP_CATEGORY_SLUGS = Object.freeze([
  "browser",
  "development",
  "documents",
  "communication",
  "utilities",
]);
