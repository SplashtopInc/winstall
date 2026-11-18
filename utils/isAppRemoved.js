/**
 * Soft-deleted catalog apps expose a non-null deletedAt.
 * Missing or null means the app is still listed.
 * @param {{ deletedAt?: string | null } | null | undefined} app
 */
export function isAppRemoved(app) {
  return app?.deletedAt != null;
}

/**
 * Pack cards: a missing catalog document is unavailable.
 * A still-present soft-deleted document is removed, and still links to its page.
 * @param {{ available?: boolean, unavailable?: boolean, removed?: boolean, deletedAt?: string | null } | null | undefined} app
 */
export function packAppAvailability(app) {
  const unavailable = app?.available === false || Boolean(app?.unavailable);
  const removed =
    !unavailable && (Boolean(app?.removed) || isAppRemoved(app));
  return { unavailable, removed };
}

/**
 * Calendar date for a deletedAt instant. UTC so the label does not shift by timezone.
 * @param {string | number | Date | null | undefined} value
 */
export function formatRemovedOn(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * @param {string} name
 */
export function removedAppDocumentTitle(name) {
  return `${name} | winstall`;
}

/**
 * @param {string} name
 */
export function removedAppDocumentDescription(name) {
  return `${name} was removed from the winget repository and can no longer be installed.`;
}
