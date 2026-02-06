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

export let timeAgo = (isoDate) => {
  let date = new Date(isoDate);

  let seconds = Math.floor((Date.now() - date) / 1000);
  let unit = "second";
  let direction = "ago";

  let value = seconds;
  if (seconds >= 31536000) {
    value = Math.floor(seconds / 31536000);
    unit = "year";
  } else if (seconds >= 86400) {
    value = Math.floor(seconds / 86400);
    unit = "day";
  } else if (seconds >= 3600) {
    value = Math.floor(seconds / 3600);
    unit = "hour";
  } else if (seconds >= 60) {
    value = Math.floor(seconds / 60);
    unit = "minute";
  }

  // if it's more than 30 days, we just return the actual date
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  if(value > 30 && unit === "day"){
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  if (value != 1) unit = unit + "s";
  return value + " " + unit + " " + direction;
}

export const getSiteOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  return "";
};

export const buildSiteUrl = (path = "") => {
  const origin = getSiteOrigin();
  if (!origin) return path || "";

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
};