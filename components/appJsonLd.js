import Head from "next/head";
import { buildAppJsonLd, serializeAppJsonLd } from "../utils/appJsonLd";

/**
 * SoftwareApplication JSON-LD for a found app detail document.
 * Renders nothing when the app cannot produce a canonical object.
 */
export default function AppJsonLd({ app }) {
  const data = buildAppJsonLd(app);
  if (!data) return null;

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeAppJsonLd(data) }}
      />
    </Head>
  );
}
