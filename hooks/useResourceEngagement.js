import { useCallback, useEffect, useState } from "react";

import useRequireAuth from "./useRequireAuth";
import {
  fetchAppStats,
  fetchPackStats,
  setResourceLike,
} from "../utils/engagementApi";

function applyLikeResult(prev, like) {
  const base = prev || { views: 0, downloads: 0, likeCount: 0, liked: false };
  return {
    ...base,
    liked: like.liked,
    likeCount:
      like.likeCount == null ? base.likeCount + (like.liked ? 1 : -1) : like.likeCount,
  };
}

export default function useResourceEngagement({
  targetType,
  targetId,
  callbackUrl,
}) {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState(false);

  const loadStats = useCallback(async () => {
    if (!targetId) return;

    const fetchStats = targetType === "pack" ? fetchPackStats : fetchAppStats;
    const { stats: next } = await fetchStats(targetId);
    setStats(next);
  }, [targetType, targetId]);

  useEffect(() => {
    setStats(null);
    loadStats();
  }, [loadStats]);

  const applyLike = useCallback(async () => {
    if (!targetId || pending) return;

    setPending(true);
    const { like, status } = await setResourceLike(targetType, targetId, true);
    setPending(false);

    if (status === 409) {
      setStats((prev) => applyLikeResult(prev, { liked: true, likeCount: null }));
      loadStats();
      return;
    }

    if (like) {
      setStats((prev) => applyLikeResult(prev, like));
    }
  }, [targetId, pending, targetType, loadStats]);

  const unlike = useCallback(async () => {
    if (!targetId || pending) return;

    setPending(true);
    const { like } = await setResourceLike(targetType, targetId, false);
    setPending(false);

    if (like) {
      setStats((prev) => applyLikeResult(prev, like));
    }
  }, [targetId, pending, targetType]);

  const { requireAuth } = useRequireAuth({
    resumeKey: targetId ? `like:${targetType}:${targetId}` : "like",
    onSuccess: applyLike,
    callbackUrl,
  });

  const onLikeClick = useCallback(() => {
    if (stats?.liked) {
      unlike();
      return;
    }
    requireAuth();
  }, [stats?.liked, unlike, requireAuth]);

  return { stats, pending, onLikeClick, reloadStats: loadStats };
}
