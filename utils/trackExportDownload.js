import { trackAppStats } from "./trackAppStats";
import { trackPackStats } from "./trackPackStats";
import { exportDownloadTargets } from "./exportDownloadTargets";

export { exportDownloadTargets, uniqueAppIds } from "./exportDownloadTargets";

/**
 * Track one export as a pack download (if any) and one download per listed app.
 * @param {{ packId?: string, apps?: Array<{ _id?: string }>, onDone?: () => void }} [input]
 */
export function reportExportDownload({ packId, apps, onDone } = {}) {
  const { packId: nextPackId, appIds } = exportDownloadTargets({ packId, apps });
  if (!nextPackId && appIds.length === 0) return;

  const tasks = [];
  if (nextPackId) {
    tasks.push(Promise.resolve(trackPackStats(nextPackId, "download")));
  }
  for (const id of appIds) {
    tasks.push(Promise.resolve(trackAppStats(id, "download")));
  }

  Promise.all(tasks).finally(() => {
    if (typeof onDone === "function") onDone();
  });
}
