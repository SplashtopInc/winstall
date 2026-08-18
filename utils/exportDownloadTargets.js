/**
 * Unique app ids from an export list. Duplicates and missing _id are skipped.
 * @param {Array<{ _id?: string } | null | undefined> | null | undefined} apps
 * @returns {string[]}
 */
export function uniqueAppIds(apps) {
  const ids = [];
  const seen = new Set();

  for (const app of apps || []) {
    const id = app && app._id;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }

  return ids;
}

/**
 * Who gets a download event for one export action.
 * Pack export: the pack plus every listed app.
 * Generate export: every listed app only.
 * @param {{ packId?: string, apps?: Array<{ _id?: string }> }} [input]
 */
export function exportDownloadTargets({ packId, apps } = {}) {
  return {
    packId: packId || null,
    appIds: uniqueAppIds(apps),
  };
}
