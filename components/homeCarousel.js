import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import useHomeBannerAds from "../hooks/useHomeBannerAds";
import styles from "../styles/homeCarousel.module.scss";

const AUTOPLAY_INTERVAL_MS = 6500;
const IMAGE_RETRY_DELAY_MS = 400;

function repaintImage(img) {
  img.style.opacity = "0.99";
  requestAnimationFrame(() => {
    img.style.opacity = "";
  });
}

function retryImage(img) {
  if (img.dataset.retried === "1") return;
  const current = img.currentSrc || img.src;
  if (!current) return;
  img.dataset.retried = "1";
  img.src = "";
  img.src = current;
}

function BannerImg({ className, src }) {
  return (
    <img
      className={className}
      src={src}
      alt=""
      decoding="sync"
      onLoad={(event) => {
        repaintImage(event.currentTarget);
      }}
      onError={(event) => {
        retryImage(event.currentTarget);
      }}
    />
  );
}

function publicAssetSrc(path) {
  if (typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export default function HomeCarousel() {
  const bannerAds = useHomeBannerAds();
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (activeIndex >= bannerAds.length) setActiveIndex(0);
  }, [activeIndex, bannerAds.length]);

  useEffect(() => {
    if (bannerAds.length < 2 || paused) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % bannerAds.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [bannerAds.length, paused]);

  useEffect(() => {
    const slide = trackRef.current?.children[activeIndex];
    if (!slide) return undefined;

    const timers = [];

    slide.querySelectorAll("img").forEach((img) => {
      if (img.complete) {
        if (img.naturalWidth === 0) retryImage(img);
        return;
      }

      timers.push(
        window.setTimeout(() => {
          if (!img.complete || img.naturalWidth === 0) retryImage(img);
        }, IMAGE_RETRY_DELAY_MS)
      );
    });

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [activeIndex, bannerAds]);

  if (bannerAds.length === 0) return null;

  return (
    <section
      className={styles.carousel}
      aria-roledescription="carousel"
      aria-label="Sponsored"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className={styles.track}
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {bannerAds.map((ad) => {
          const imageSrc = publicAssetSrc(ad.image);
          const bannerBgSrc = publicAssetSrc(ad["banner-bg"]);
          return (
          <article
            key={ad.id}
            className={`${styles.slide} ${styles.adSlide}`}
            style={{
              "--ad-start-color": ad["start-color"],
              "--ad-end-color": ad["end-color"],
            }}
          >
            {bannerBgSrc ? (
              <span className={styles.adDecor} aria-hidden="true">
                <BannerImg className={styles.adDecorImg} src={bannerBgSrc} />
              </span>
            ) : null}
            <div className={styles.adMedia} aria-hidden="true">
              {imageSrc ? (
                <BannerImg className={styles.adImage} src={imageSrc} />
              ) : (
                <span className={styles.adMediaPlaceholder} />
              )}
            </div>
            <div className={styles.adCopy}>
              <h2 className={styles.adName}>{ad.name}</h2>
              <p className={styles.adHeadline}>{ad.headline}</p>
              <p className={styles.adBody}>{ad.body}</p>
              <a
                className={styles.adCta}
                href={ad.href}
                rel="sponsored noopener"
                target="_blank"
              >
                {ad.cta}
              </a>
            </div>
          </article>
          );
        })}
      </div>

      {bannerAds.length > 1 && (
        <div className={styles.controls} aria-label="Carousel controls">
          <button
            type="button"
            className={styles.ctrl}
            onClick={() =>
              setActiveIndex(
                (current) =>
                  (current - 1 + bannerAds.length) % bannerAds.length
              )
            }
            aria-label="Previous slide"
          >
            <FiChevronLeft />
          </button>
          <span className={styles.status} aria-live="polite">
            {activeIndex + 1} / {bannerAds.length}
          </span>
          <button
            type="button"
            className={styles.ctrl}
            onClick={() =>
              setActiveIndex((current) => (current + 1) % bannerAds.length)
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
