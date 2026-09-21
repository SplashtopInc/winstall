import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import useRequireAuth from "./useRequireAuth";
import {
  fetchAppStats,
  fetchPackStats,
  fetchResourceLike,
  setResourceLike,
} from "../utils/engagementApi";

function emptyStats() {
  return { views: 0, downloads: 0, likeCount: 0, liked: false };
}

function applyLikeResult(prev, like) {
  const base = prev || emptyStats();
  return {
    ...base,
    liked: like.liked,
    likeCount:
      like.likeCount == null
        ? base.likeCount + (like.liked ? 1 : -1)
        : like.likeCount,
  };
}

function mergeStatsCounters(prev, next, { preserveLikeCount }) {
  if (!next) return prev;
  const base = prev || emptyStats();
  return {
    ...base,
    views: next.views,
    downloads: next.downloads,
    likeCount: preserveLikeCount ? base.likeCount : next.likeCount,
  };
}

export default function useResourceEngagement({
  targetType,
  targetId,
  callbackUrl,
}) {
  const { data: session, status: sessionStatus } = useSession();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState(false);
  const likeSurfaceReady = useRef(false);
  const isSignedIn = sessionStatus === "authenticated" && !!session?.user;

  const loadStats = useCallback(async () => {
    if (!targetId) return;

    const fetchStats = targetType === "pack" ? fetchPackStats : fetchAppStats;
    const { stats: next } = await fetchStats(targetId);
    setStats((prev) =>
      mergeStatsCounters(prev, next, {
        preserveLikeCount: likeSurfaceReady.current,
      })
    );
  }, [targetType, targetId]);

  const loadLike = useCallback(async () => {
    if (!targetId || !isSignedIn) return;

    const { like, error } = await fetchResourceLike(targetType, targetId);
    if (error || !like) {
      setStats((prev) => {
        const base = prev || emptyStats();
        return { ...base, liked: false };
      });
      return;
    }

    likeSurfaceReady.current = true;
    setStats((prev) => applyLikeResult(prev, like));
  }, [targetType, targetId, isSignedIn]);

  useEffect(() => {
    likeSurfaceReady.current = false;
    setStats(null);
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!isSignedIn) return;
    loadLike();
  }, [isSignedIn, loadLike]);

  const applyLike = useCallback(async () => {
    if (!targetId || pending) return;

    setPending(true);
    const { like, status } = await setResourceLike(targetType, targetId, true);
    setPending(false);

    if (status === 409) {
      setStats((prev) => applyLikeResult(prev, { liked: true, likeCount: null }));
      likeSurfaceReady.current = true;
      loadLike();
      return;
    }

    if (like) {
      likeSurfaceReady.current = true;
      setStats((prev) => applyLikeResult(prev, like));
    }
  }, [targetId, pending, targetType, loadLike]);

  const unlike = useCallback(async () => {
    if (!targetId || pending) return;

    setPending(true);
    const { like } = await setResourceLike(targetType, targetId, false);
    setPending(false);

    if (like) {
      likeSurfaceReady.current = true;
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
