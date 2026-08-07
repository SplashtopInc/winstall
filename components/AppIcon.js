import popularAppsList from "../data/popularApps.json";
import categoryAppsList from "../data/categoryApps.json";
import { useState } from "react";
import { getIconBase } from "../utils/runtimeConfig";

function GenericAppIcon() {
  return (
    <img
      src="/generic-app-icon.svg"
      alt=""
      aria-hidden="true"
      width="25"
      height="25"
    />
  );
}

const AppIcon = ({ id, name, icon, iconUrl, iconPng }) => {
  const targetApp =
    Object.values(popularAppsList).find((app) => app._id === id) ||
    Object.values(categoryAppsList).flat().find((app) => app._id === id);
  if (targetApp) {
    return (
      <AppPicture
        srcSetPng={`/assets/apps/fallback/${targetApp.img.replace("webp", "png")}`}
        srcSetWebp={`/assets/apps/${targetApp.img}`}
      />
    );
  }

  if (iconUrl && iconPng) {
    return <AppPicture srcSetPng={iconPng} srcSetWebp={iconUrl} />;
  }

  if (!icon) {
    return <GenericAppIcon />;
  }

  if (icon.startsWith("http")) {
    return <ExternalAppIcon src={icon} />;
  }

  icon = icon.replace(".png", "");

  return (
    <AppPicture
      srcSetPng={`${getIconBase()}/icons/${icon}.png`}
      srcSetWebp={`${getIconBase()}/icons/next/${icon}.webp`}
    />
  );
};

const ExternalAppIcon = ({ src }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <GenericAppIcon />;
  }

  return (
    <img
      src={src}
      draggable={false}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      width="25"
      height="25"
      onError={() => setHasError(true)}
    />
  );
};

const AppPicture = ({ srcSetPng, srcSetWebp }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <GenericAppIcon />;
  }

  return (
    <picture>
      <source srcSet={srcSetWebp} type="image/webp" />
      <source srcSet={srcSetPng} type="image/png" />
      <img
        src={srcSetPng}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
        width="25"
        height="25"
        onError={() => setHasError(true)}
      />
    </picture>
  );
};

export default AppIcon;
