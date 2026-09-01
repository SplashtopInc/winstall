import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import AppIcon from "./AppIcon";
import useRandomAd from "../hooks/useRandomAd";
import {
  DEFAULT_ACCENT,
  loadImageAccent,
  storyWashTint,
} from "../utils/iconAccent";
import { resolveAppIconSampleUrl } from "../utils/resolveAppIconSampleUrl";
import {
  getTopTrendingPack,
  readTrendingCounts,
} from "../utils/trendingData";
import { formatCount } from "../utils/engagementStats";
import styles from "../styles/homeCarousel.module.scss";

const AUTOPLAY_INTERVAL_MS = 6500;
const PACK_PREVIEW_LIMIT = 6;
const DEFAULT_PACK_ACCENT = "#d4a017";

function buildAppDescription(app) {
  if (app?.desc) return app.desc;
  if (app?.description) return app.description;
  if (app?.publisher) {
    return `From ${app.publisher}. The most downloaded app on this week's chart — open the page for versions and install options.`;
  }
  return "The most downloaded app on this week's chart — open the page for versions and install options.";
}

function buildPackDescription(pack) {
  if (pack?.desc) return pack.desc;
  const names = (pack?.apps || [])
    .slice(0, 3)
    .map((app) => app.name)
    .filter(Boolean);
  if (names.length > 0) {
    return `Includes ${names.join(", ")}, and more.`;
  }
  return "A curated collection of apps people are installing together this week.";
}

export default function HomeCarousel({ topApp, trendingPacks = [] }) {
  const ad = useRandomAd("home");
  const normalizedPack = useMemo(
    () => getTopTrendingPack(trendingPacks),
    [trendingPacks]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [storyTint, setStoryTint] = useState(DEFAULT_ACCENT);
  const [packTint, setPackTint] = useState(DEFAULT_PACK_ACCENT);

  const slides = useMemo(() => {
    const next = [];
    if (topApp) next.push("app");
    if (normalizedPack) next.push("pack");
    if (ad) next.push("ad");
    return next;
  }, [topApp, normalizedPack, ad]);

  useEffect(() => {
    if (activeIndex >= slides.length) setActiveIndex(0);
  }, [activeIndex, slides.length]);

  useEffect(() => {
    let cancelled = false;

    if (!topApp) {
      setStoryTint(DEFAULT_ACCENT);
      return undefined;
    }

    const sampleUrl = resolveAppIconSampleUrl(topApp);
    if (!sampleUrl) {
      setStoryTint(DEFAULT_ACCENT);
      return undefined;
    }

    loadImageAccent(sampleUrl).then((accent) => {
      if (cancelled) return;
      setStoryTint(storyWashTint(accent || DEFAULT_ACCENT));
    });

    return () => {
      cancelled = true;
    };
  }, [topApp]);

  useEffect(() => {
    let cancelled = false;

    if (!normalizedPack) {
      setPackTint(storyWashTint(DEFAULT_PACK_ACCENT));
      return undefined;
    }

    const previewApp = (normalizedPack.apps || []).find((app) =>
      resolveAppIconSampleUrl(app)
    );
    const sampleUrl = previewApp ? resolveAppIconSampleUrl(previewApp) : null;

    if (!sampleUrl) {
      setPackTint(storyWashTint(DEFAULT_PACK_ACCENT));
      return undefined;
    }

    loadImageAccent(sampleUrl).then((accent) => {
      if (cancelled) return;
      setPackTint(storyWashTint(accent || DEFAULT_PACK_ACCENT));
    });

    return () => {
      cancelled = true;
    };
  }, [normalizedPack]);

  useEffect(() => {
    if (slides.length < 2 || paused) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  const counts = topApp ? readTrendingCounts(topApp) : null;
  const downloadsLabel = formatCount(counts?.downloads) ?? "0";
  const viewsLabel = formatCount(counts?.views) ?? "0";
  const controlsOnDark = slides[activeIndex] === "ad";
  const previewApps = normalizedPack
    ? (normalizedPack.apps || []).slice(0, PACK_PREVIEW_LIMIT)
    : [];

  return (
    <section
      className={styles.carousel}
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={styles.track}
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {topApp && (
          <Link
            href={`/apps/${encodeURIComponent(topApp._id)}`}
            prefetch={false}
            className={`${styles.slide} ${styles.story}`}
            style={{ "--story-tint": storyTint }}
            aria-label={`See details for ${topApp.name}`}
          >
            <span className={styles.storyDecor} aria-hidden="true" />
            <span className={styles.storyMedia} aria-hidden="true">
              <span className={styles.storyIcon}>
                <AppIcon
                  id={topApp._id}
                  name={topApp.name}
                  icon={topApp.icon}
                  iconUrl={topApp.iconUrl}
                  iconPng={topApp.iconPng}
                />
              </span>
            </span>
            <span className={styles.storyInfo}>
              <span className={styles.storyKicker}>#1 this week</span>
              <h2>{topApp.name}</h2>
              <p className={styles.storyDesc}>{buildAppDescription(topApp)}</p>
              <span className={styles.storyMeta}>
                <span>
                  <strong>{downloadsLabel}</strong>
                  <small>Downloads</small>
                </span>
                <span className={styles.storyMetaSep} aria-hidden="true" />
                <span>
                  <strong>{viewsLabel}</strong>
                  <small>Views</small>
                </span>
              </span>
              <span className={styles.storyCta}>See details</span>
            </span>
          </Link>
        )}

        {normalizedPack && (
          <Link
            href={`/packs/${encodeURIComponent(normalizedPack._id)}`}
            prefetch={false}
            className={`${styles.slide} ${styles.packStory}`}
            style={{ "--pack-tint": packTint }}
            aria-label={`See collection ${normalizedPack.title}`}
          >
            <span className={styles.packDecor} aria-hidden="true" />
            <span className={styles.packBody}>
              <span className={styles.packKicker}>#1 pack this week</span>
              <h2>{normalizedPack.title}</h2>
              <p className={styles.packDesc}>
                {buildPackDescription(normalizedPack)}
              </p>
              {previewApps.length > 0 && (
                <span className={styles.packIcons} aria-hidden="true">
                  {previewApps.map((app) => (
                    <span className={styles.packIconMark} key={app._id || app.name}>
                      <AppIcon
                        id={app._id}
                        name={app.name}
                        icon={app.icon}
                        iconUrl={app.iconUrl}
                        iconPng={app.iconPng}
                      />
                    </span>
                  ))}
                </span>
              )}
              <span className={styles.packCta}>See collection</span>
            </span>
          </Link>
        )}

        {ad && (
          <article className={`${styles.slide} ${styles.adSlide}`}>
            <span className={styles.adBadge}>Ad</span>
            <h2>{ad.headline}</h2>
            <p>{ad.body}</p>
            <a href={ad.href} rel="sponsored noopener" target="_blank">
              {ad.cta}
            </a>
          </article>
        )}
      </div>

      {slides.length > 1 && (
        <div
          className={`${styles.controls} ${
            controlsOnDark ? styles.controlsOnDark : ""
          }`}
          aria-label="Carousel controls"
        >
          <button
            type="button"
            className={styles.ctrl}
            onClick={() =>
              setActiveIndex(
                (current) => (current - 1 + slides.length) % slides.length
              )
            }
            aria-label="Previous slide"
          >
            <FiChevronLeft />
          </button>
          <span className={styles.status} aria-live="polite">
            {activeIndex + 1} / {slides.length}
          </span>
          <button
            type="button"
            className={styles.ctrl}
            onClick={() =>
              setActiveIndex((current) => (current + 1) % slides.length)
            }
            aria-label="Next slide"
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </section>
  );
}
