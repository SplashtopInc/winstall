import { useState } from "react";

import styles from "../styles/home.module.scss";

import categoryAppsList from "../data/categoryApps.json";

import CategorySearch from "../components/CategorySearch";
import { ListCategory } from "../components/ListCategory";
import Categories from "../components/Categories";
import MetaTags from "../components/MetaTags";

import Footer from "../components/Footer";
import Error from "../components/Error";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";
import { getRevalidateTime } from "../utils/revalidateCache";

const categoryNames = {
  "all": "All",
  "browser": "Web Browsers",
  "communication": "Communication",
  "social_media": "Social Media",
  "productivity": "Productivity",
  "documents": "Office & Documents",
  "collaboration": "Meeting & Collaboration",
  "cloud_storage": "Cloud Storage & Sync",
  "development": "Developer Tools",
  "entertainment": "Media & Entertainment",
  "utilities": "Utilities",
  "security": "Security",
  "game": "Game",
  "photo": "Photo, Design & Video",
  "screenshots": "Screenshots & Screen Recording",
  "runtimes": "Runtimes",
};

function ExpressSetup({ error, categoryApps }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");

  if (error) {
    return <Error title="Oops!" subtitle={error} />;
  }

  // Use enriched data if available, fallback to static data
  const appsData = categoryApps || categoryAppsList;

  // Prepare categories list for ListCategory component
  const categoriesList = [
    { key: "all", name: categoryNames["all"] },
    ...Object.entries(appsData)
      .filter(([key, apps]) => Array.isArray(apps) && apps.length > 0)
      .map(([key, apps]) => ({
        key,
        name: categoryNames[key] || key
      }))
  ];

  return (
    <div>
      <MetaTags title="Pick the apps you want - winstall" path="/express" />
      <div className={styles.intro}>
        <div className="illu-box">
          <div>
            <h1>Pick the apps you want</h1>
            <p className={styles.lead}>Here are the most popular apps, you can pick and install them instantly.</p>
            <div className={styles.searchFilters}>
              <CategorySearch
                onFilter={(q) => setSearchInput(q)}
                label="Search for apps"
                placeholder={"Enter you search term here"}
              />
              <ListCategory
                categories={categoriesList}
                defaultCategory="all"
                onCategoryChange={setSelectedCategory}
              />
            </div>
          </div>
          <div className="art">
              <img
                src="/assets/logo.svg"
                draggable={false}
                alt="winstall logo"
              />
            </div>
        </div>
      </div>

      {Object.entries(appsData).map(([key, apps]) => {
        if (!Array.isArray(apps) || apps.length === 0) return null;

        // Filter by selected category
        if (selectedCategory !== "all" && key !== selectedCategory) return null;

        // Filter apps by search input
        let filteredApps = apps;
        if (searchInput && searchInput.trim()) {
          const searchTerm = searchInput.toLowerCase().trim();
          filteredApps = apps.filter(app =>
            app.name && app.name.toLowerCase().includes(searchTerm)
          );
        }

        // Skip categories with no matching apps
        if (filteredApps.length === 0) return null;

        const categoryName = categoryNames[key] || key;

        return (
          <Categories
            key={key}
            apps={filteredApps}
            category={categoryName}
          />
        );
      })}

      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  const { getRuntimeConfig } = require("../utils/runtimeConfig");
  const config = await getRuntimeConfig();

  // Docker/build has no WINSTALL_API_BASE — don't bake empty static apps for an hour.
  // Same pattern as pages/index.js and pages/apps.js.
  if (!config.apiBase) {
    console.warn(
      "[getStaticProps /express] Build-time: no API configured, will trigger ISR on first request"
    );
    return {
      props: {
        categoryApps: categoryAppsList,
        buildTime: true,
      },
      revalidate: 1,
    };
  }

  const enrichedCategories = {};
  let enrichedCount = 0;
  let totalCount = 0;

  for (const [category, apps] of Object.entries(categoryAppsList)) {
    if (!Array.isArray(apps) || apps.length === 0) {
      enrichedCategories[category] = apps;
      continue;
    }

    const enrichedApps = await Promise.all(
      apps.map(async (entry) => {
        totalCount += 1;
        const { response: appData } = await fetchWinstallAPI(
          `/apps/${entry._id}?exclude=versions`
        );

        if (!appData) {
          return entry;
        }

        enrichedCount += 1;

        if (appData.icon && !appData.icon.startsWith("http") && !appData.iconUrl) {
          const iconName = appData.icon.replace(".png", "");
          appData.iconUrl = `${process.env.NEXT_PUBLIC_WINSTALL_API_BASE}/icons/next/${iconName}.webp`;
          appData.iconPng = `${process.env.NEXT_PUBLIC_WINSTALL_API_BASE}/icons/${iconName}.png`;
        }

        return {
          ...appData,
          _id: entry._id,
          img: entry.img,
        };
      })
    );

    enrichedCategories[category] = enrichedApps.filter(Boolean);
  }

  const enrichSucceeded = enrichedCount > 0 && enrichedCount >= totalCount * 0.5;
  const revalidate = getRevalidateTime("express", enrichSucceeded);

  if (!enrichSucceeded) {
    console.warn(
      `[getStaticProps /express] Enrich incomplete (${enrichedCount}/${totalCount}), retry in ${revalidate}s`
    );
  } else {
    console.log(
      `[getStaticProps /express] Success: ${enrichedCount}/${totalCount} apps, revalidate in ${revalidate}s`
    );
  }

  return {
    props: {
      categoryApps: enrichedCategories,
    },
    revalidate,
  };
}

export default ExpressSetup;
