import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import useHomeBannerAds from "../hooks/useHomeBannerAds";
import styles from "../styles/homeCarousel.module.scss";

const AUTOPLAY_INTERVAL_MS = 6500;

function publicAssetSrc(path) {
  if (typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export default function HomeCarousel() {
  const bannerAds = useHomeBannerAds();
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
                <img className={styles.adDecorImg} src={bannerBgSrc} alt="" />
              </span>
            ) : null}
            <div className={styles.adMedia} aria-hidden="true">
              {imageSrc ? (
                <img className={styles.adImage} src={imageSrc} alt="" />
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
