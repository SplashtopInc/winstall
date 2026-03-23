import Head from "next/head";
import { buildSiteUrl, getSiteOrigin } from "../utils/helpers";

const MetaTags = ({ title, desc="Bulk install Windows apps quickly with Windows Package Manager.", path = "/" }) => {
  const siteOrigin = getSiteOrigin();
  const coverUrl = siteOrigin ? buildSiteUrl("/cover.png") : undefined;
  const appleTouchIcon = buildSiteUrl("/logo192.png") || "/logo192.png";
  const manifestUrl = buildSiteUrl("/manifest.json") || "/manifest.json";

  // Canonical URL: strip trailing slash except for root, no query params
  const normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");
  const canonicalUrl = siteOrigin ? `${siteOrigin}${normalizedPath}` : undefined;

    return (
      <Head>
        <title>{title}</title>
        <meta
          name="title"
          content={title}
        />
        <meta
          name="description"
          content={desc}
        ></meta>

        <link rel="icon" href="/favicon.ico" />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#9b2eff" />

        <meta property="og:type" content="website" />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content={desc}
        />
        {coverUrl && <meta property="og:image" content={coverUrl} />}

        <meta property="twitter:card" content="summary_large_image" />
        {canonicalUrl && <meta property="twitter:url" content={canonicalUrl} />}
        <meta property="twitter:title" content={title} />
        <meta
          property="twitter:description"
          content={desc}
        />
        {coverUrl && <meta
          property="twitter:image"
          content={coverUrl}
        />}

        <link rel="apple-touch-icon" href={appleTouchIcon} />
        <link rel="manifest" href={manifestUrl} />
      </Head>
    );
}

export default MetaTags;