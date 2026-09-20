export let shuffleArray = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export let checkTheme = () => {
  let isLight = false;

  const themeChecker = window.matchMedia('(prefers-color-scheme: light)');

  // if user doesn't have preference, we check their browser theme
  if (!localStorage.getItem("wiTheme")) {
    if (themeChecker.matches) {
      document.body.classList.add("light");
      localStorage.setItem("wiTheme", "light")
      isLight = true;
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("wiTheme", "dark")
      isLight = false;
    }
  } else{
    isLight = localStorage.getItem("wiTheme") === "light" ? true : false;

    if(isLight){
      document.body.classList.add("light");
    } else{
      document.body.classList.add("dark");
    }
  }

  // listen to browser theme changes
  if (window.matchMedia) {
    themeChecker.addListener(() => {
      if (themeChecker.matches) {
        localStorage.setItem("wiTheme", "light")
        document.body.classList.replace("dark", "light");
        isLight = true;
      } else {
        localStorage.setItem("wiTheme", "dark")
        document.body.classList.replace("light", "dark");
        isLight = false
      }
    })
  }

  return isLight;
}

export let compareVersion = (v1, v2) => {
  if (typeof v1 !== "string") return false;
  if (typeof v2 !== "string") return false;

  // deal with version strings like 78.0b1
  if (v1.match(/\d([A-Za-z])\d/) && v2.match(/\d([A-Za-z])\d/)){
    if(v1 > v2) return 1;
    if(v1 < v2) return -1;
    if(v1 === v2) return 0;
  }

  v1 = v1.split(".");
  v2 = v2.split(".");
  const k = Math.min(v1.length, v2.length);
  for (let i = 0; i < k; ++i) {
    v1[i] = parseInt(v1[i], 10);
    v2[i] = parseInt(v2[i], 10);
    if (v1[i] > v2[i]) return 1;
    if (v1[i] < v2[i]) return -1;
  }
  return v1.length === v2.length ? 0 : v1.length < v2.length ? -1 : 1;
}

const MINUTE_SECONDS = 60;
const HOUR_SECONDS = 60 * MINUTE_SECONDS;
const DAY_SECONDS = 24 * HOUR_SECONDS;
const WEEK_SECONDS = 7 * DAY_SECONDS;
const MONTH_SECONDS = 30 * DAY_SECONDS;
const YEAR_SECONDS = 365 * DAY_SECONDS;

export let timeAgo = (isoDate, now = Date.now()) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.floor((now - date.getTime()) / 1000);
  if (!Number.isFinite(seconds) || seconds < MINUTE_SECONDS) {
    return "just now";
  }

  let value;
  let unit;

  if (seconds < HOUR_SECONDS) {
    value = Math.floor(seconds / MINUTE_SECONDS);
    unit = "minute";
  } else if (seconds < DAY_SECONDS) {
    value = Math.floor(seconds / HOUR_SECONDS);
    unit = "hour";
  } else if (seconds < WEEK_SECONDS) {
    value = Math.floor(seconds / DAY_SECONDS);
    unit = "day";
  } else if (seconds < MONTH_SECONDS) {
    value = Math.floor(seconds / WEEK_SECONDS);
    unit = "week";
  } else if (seconds < YEAR_SECONDS) {
    value = Math.floor(seconds / MONTH_SECONDS);
    unit = "month";
  } else {
    value = Math.floor(seconds / YEAR_SECONDS);
    unit = "year";
  }

  const label = value === 1 ? unit : `${unit}s`;
  return `${value} ${label} ago`;
}

export const getSiteOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }

  return "";
};

export const buildSiteUrl = (path = "") => {
  const origin = getSiteOrigin();
  if (!origin) return path || "";

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
};