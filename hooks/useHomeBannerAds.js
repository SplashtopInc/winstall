import { useEffect, useState } from "react";
import ads from "../data/ads.json";
import {
  buildAdHref,
  pickHomeBannerAds,
} from "../utils/pickAd";

const CONTENT_SUFFIXES = ["a", "b"];

/**
 * Client-only home banner ads (max 2), independent of shelf pickAd.
 */
export default function useHomeBannerAds() {
  const [bannerAds, setBannerAds] = useState([]);

  useEffect(() => {
    const selected = pickHomeBannerAds(ads);
    setBannerAds(
      selected.map((ad, index) => ({
        ...ad,
        href: buildAdHref(ad, "home", CONTENT_SUFFIXES[index] || "a"),
      }))
    );
  }, []);

  return bannerAds;
}
