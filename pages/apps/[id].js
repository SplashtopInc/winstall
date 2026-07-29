import Skeleton from "react-loading-skeleton";
import { useRouter } from "next/router";

import styles from "../../styles/home.module.scss";

import AppDetailView from "../../components/AppDetailView";
import AppNotFound from "../../components/AppNotFound";
import DonateCard from "../../components/DonateCard";
import Footer from "../../components/Footer";
import MetaTags from "../../components/MetaTags";
import MoreByPublisher from "../../components/MoreByPublisher";
import RelatedApps from "../../components/RelatedApps";
import fetchWinstallAPI from "../../utils/fetchWinstallAPI";

function AppSkeleton() {
  return (
    <div>
      <div className="skeleton-group">
        <Skeleton circle={true} height={44} width={44} />
        <Skeleton count={1} height={28} />
      </div>
      <Skeleton count={1} height={56} style={{ marginTop: 20 }} />
      <Skeleton count={3} height={20} style={{ marginTop: 24 }} />
      <div className="skeleton-list">
        <Skeleton count={5} width={250} />
      </div>
      <div className="skeleton-button">
        <Skeleton count={1} width={180} height={44} />
      </div>
    </div>
  );
}

function AppDetail({ app }) {
  const router = useRouter();
  const showRelatedApps = process.env.NEXT_PUBLIC_SHOW_RELATED_APPS === 'true';
  const showMoreByPublisher = process.env.NEXT_PUBLIC_SHOW_MORE_BY_PUBLISHER === 'true';
  const packageId =
    typeof router.query.id === "string" ? router.query.id : "";

  if (!router.isFallback && !app) {
    return (
      <div>
        <MetaTags
          title="App not found | winstall"
          path={packageId ? `/apps/${packageId}` : "/apps"}
        />
        <AppNotFound packageId={packageId} />
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.intro}>
        {router.isFallback ? (
          <AppSkeleton />
        ) : (
          <>
            <MetaTags
              title={`Install ${app.name} with WinGet | winstall`}
              desc={`Install ${app.name} via WinGet. Copy the winget install command instantly. ${app.fullDesc || app.desc}`}
              path={`/apps/${app._id}`}
            />
            <AppDetailView app={app} />
          </>
        )}
      </div>

      {!router.isFallback && app && showMoreByPublisher && (
        <MoreByPublisher publisher={app.publisher} currentAppId={app._id} />
      )}

      {!router.isFallback && app && showRelatedApps && (
        <RelatedApps appId={app._id} />
      )}

      <Footer />
    </div>
  );
}

/**
 * Keep only fields the detail page needs.
 * Full API payloads (esp. installers[] per version) easily exceed Next.js's 128 kB page-data limit.
 */
function slimAppForDetailPage(app) {
  if (!app) return null;

  return {
    _id: app._id,
    name: app.name,
    desc: app.desc || "",
    fullDesc: app.fullDesc || "",
    homepage: app.homepage || "",
    icon: app.icon || "",
    latestVersion: app.latestVersion || "",
    license: app.license || "",
    licenseUrl: app.licenseUrl || "",
    minOS: app.minOS || "",
    publisher: app.publisher || "",
    copyright: app.copyright || "",
    tags: Array.isArray(app.tags) ? app.tags : [],
    updatedAt: app.updatedAt || null,
    versions: Array.isArray(app.versions)
      ? app.versions.map((v) => ({
          version: v.version,
        }))
      : [],
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  try {
    let { response: app } = await fetchWinstallAPI(`/apps/${params.id}`);

    const slimApp = slimAppForDetailPage(app);

    return {
      props: slimApp ? { app: slimApp } : {},
      revalidate: 3600,
    };
  } catch (err) {
    return { props: {}, revalidate: 3600 };
  }
}

export default AppDetail;
