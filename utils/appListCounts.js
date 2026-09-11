export function readAppListCounts(app) {
  return {
    viewCount: Number(app?.viewCount) || 0,
    downloadCount: Number(app?.downloadCount) || 0,
    likeCount: Number(app?.likeCount) || 0,
  };
}
