import { useContext, useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiCheck, FiPlus } from "react-icons/fi";

import AppIcon from "./AppIcon";
import SelectedContext from "../ctx/SelectedContext";
import useRandomAd from "../hooks/useRandomAd";
import styles from "../styles/homeCarousel.module.scss";

const AUTOPLAY_INTERVAL_MS = 6500;

export default function HomeCarousel({ topApp }) {
  const ad = useRandomAd("home");
  const { selectedApps, setSelectedApps } = useContext(SelectedContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = useMemo(
    () => [topApp ? "app" : null, ad ? "ad" : null].filter(Boolean),
    [topApp, ad]
  );

  useEffect(() => {
    if (activeIndex >= slides.length) setActiveIndex(0);
  }, [activeIndex, slides.length]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const isSelected = topApp
    ? selectedApps.some((app) => app._id === topApp._id)
    : false;

  const toggleTopApp = () => {
    if (!topApp) return;
    if (isSelected) {
      setSelectedApps(selectedApps.filter((app) => app._id !== topApp._id));
      return;
    }

    setSelectedApps([
      ...selectedApps,
      {
        ...topApp,
        selectedVersion: topApp.selectedVersion || topApp.latestVersion,
      },
    ]);
  };

  const showPrevious = () => {
    setActiveIndex(
      (current) => (current - 1 + slides.length) % slides.length
    );
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <section
      className={styles.carousel}
      aria-roledescription="carousel"
      aria-label="Featured"
    >
      <div
        className={styles.track}
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {topApp && (
          <article className={`${styles.slide} ${styles.appSlide}`}>
            <p className={styles.eyebrow}>#1 this week</p>
            <h2>{topApp.name}</h2>
            <p>The most downloaded app on this week&apos;s chart.</p>
            <div className={styles.appDock}>
              <span className={styles.appIcon}>
                <AppIcon
                  id={topApp._id}
                  name={topApp.name}
                  icon={topApp.icon}
                  iconUrl={topApp.iconUrl}
                  iconPng={topApp.iconPng}
                />
              </span>
              <span className={styles.appCopy}>
                <strong>{topApp.name}</strong>
                {topApp.publisher && <small>{topApp.publisher}</small>}
              </span>
              <button
                type="button"
                className={`${styles.getButton} ${
                  isSelected ? styles.getButtonSelected : ""
                }`}
                onClick={toggleTopApp}
                aria-pressed={isSelected}
              >
                {isSelected ? <FiCheck /> : <FiPlus />}
                {isSelected ? "ADDED" : "GET"}
              </button>
            </div>
          </article>
        )}
        {ad && (
          <article className={`${styles.slide} ${styles.adSlide}`}>
            <span className={styles.adBadge}>Ad</span>
            <h2>{ad.headline}</h2>
            <p>{ad.body}</p>
            <a href={ad.href} rel="sponsored noopener" target="_blank">
              <FiPlus aria-hidden="true" />
              {ad.cta}
            </a>
          </article>
        )}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.previous}`}
            onClick={showPrevious}
            aria-label="Previous slide"
          >
            <FiChevronLeft />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            onClick={showNext}
            aria-label="Next slide"
          >
            <FiChevronRight />
          </button>
          <div className={styles.dots}>
            {slides.map((slide, index) => (
              <button
                type="button"
                key={slide}
                className={index === activeIndex ? styles.dotActive : ""}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
