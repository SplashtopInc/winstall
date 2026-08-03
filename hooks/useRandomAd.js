import { useEffect, useState } from "react";
import ads from "../data/ads.json";
import { buildAdHref, pickAd } from "../utils/pickAd";

export default function useRandomAd(placement = "unknown") {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    const selected = pickAd(ads);
    if (!selected) {
      setAd(null);
      return;
    }
    setAd({
      ...selected,
      href: buildAdHref(selected, placement),
    });
  }, [placement]);

  return ad;
}
