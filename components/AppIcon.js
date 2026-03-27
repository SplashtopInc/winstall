import styles from "../styles/singleApp.module.scss";
import popularAppsList from "../data/popularApps.json";
import { useState, useEffect } from "react";

const AppIcon = ({id, name, icon, iconUrl, iconPng}) => {
    const [apiBase, setApiBase] = useState('');

    useEffect(() => {
        if (!iconUrl && icon && !icon.startsWith('http')) {
            fetch('/api/config')
                .then(res => res.json())
                .then(config => setApiBase(config.apiBase));
        }
    }, [iconUrl, icon]);

    // if the app is listed in popularApps, use the image specified there
    const popularApps = Object.values(popularAppsList).filter((app) => app._id === id);
    if (popularApps.length === 1) {
      return (
        <AppPicture
          name={name}
          srcSetPng={`/assets/apps/fallback/${popularApps[0].img.replace("webp", "png")}`}
          srcSetWebp={`/assets/apps/${popularApps[0].img}`}
        />
      );
    }

    if(!icon) {
        return (
          <img
              src="/generic-app-icon.svg"
              alt="Package icon"
              // Specify the size to avoid Cumulative Layout Shift:
              width="25"
              height="25"
            />
        );
    }

    if (icon.startsWith("http")) {
      return (
        // if icon is not hosted on winstall
        icon.startsWith("http") && (
          <img
            src={icon}
            draggable={false}
            alt={`Logo for ${name}`}
            loading="lazy"
            decoding="async"
            // Specify the size to avoid Cumulative Layout Shift:
            width="25"
            height="25"
          />
        )
      );
    }

    icon = icon.replace(".png", "")

    // Use pre-rendered URLs from ISR or fetch apiBase for dynamic content
    if (iconUrl && iconPng) {
        return (
          <AppPicture
            name={name}
            srcSetPng={iconPng}
            srcSetWebp={iconUrl}
          />
        );
    }

    // Fallback for dynamic content - wait for API base URL
    if (!apiBase) {
        return (
          <img
            src="/generic-app-icon.svg"
            alt="Package icon"
            width="25"
            height="25"
          />
        );
    }

    return (
      <AppPicture
        name={name}
        srcSetPng={`${apiBase}/icons/${icon}.png`}
        srcSetWebp={`${apiBase}/icons/next/${icon}.webp`}
      />
    );
}

const AppPicture = ({ name, srcSetPng, srcSetWebp }) => {
  return (
    <picture>
      <source srcSet={srcSetWebp} type="image/webp" />
      <source srcSet={srcSetPng} type="image/png" />
      <img
        src={srcSetPng}
        alt={`Logo for ${name}`}
        draggable={false}
        loading="lazy"
        decoding="async"
        // Specify the size to avoid Cumulative Layout Shift:
        width="25"
        height="25"
      />
    </picture>
  );
}

export default AppIcon;