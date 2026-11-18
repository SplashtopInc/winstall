import Head from "next/head";
import {
  buildAppBreadcrumbJsonLd,
  buildCategoryBreadcrumbJsonLd,
  buildPackDetailBreadcrumbJsonLd,
  buildPackListBreadcrumbJsonLd,
  serializeBreadcrumbJsonLd,
} from "../utils/breadcrumbJsonLd";

function resolveBreadcrumb({ categorySlug, app, pack, variant }) {
  if (app) return buildAppBreadcrumbJsonLd(app);
  if (pack) return buildPackDetailBreadcrumbJsonLd(pack);
  if (variant === "packs") return buildPackListBreadcrumbJsonLd();
  if (categorySlug != null) return buildCategoryBreadcrumbJsonLd(categorySlug);
  return null;
}

/**
 * BreadcrumbList JSON-LD. Renders nothing when the page cannot produce a trail.
 * Pass one of: categorySlug, app, pack, or variant="packs".
 */
export default function BreadcrumbJsonLd(props) {
  const data = resolveBreadcrumb(props);
  if (!data) return null;

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeBreadcrumbJsonLd(data) }}
      />
    </Head>
  );
}
