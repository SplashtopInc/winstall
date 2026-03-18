/**
 * Google Tag Manager DataLayer Helper
 *
 * This utility provides methods to push events to GTM dataLayer
 */

/**
 * Push a page view event to GTM dataLayer
 * @param {string} url - The page URL/path
 */
export const trackPageView = (url) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_location: window.location.href,
      page_path: url,
      page_title: document.title
    });
  }
};

/**
 * Push a search event to GTM dataLayer
 * @param {string} searchTerm - The search query
 * @param {number} resultsCount - Number of search results
 */
export const trackSearch = (searchTerm, resultsCount) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'search',
      search_term: searchTerm,
      search_results: resultsCount
    });
  }
};

/**
 * Push an app install click event to GTM dataLayer
 * @param {string} appId - The app identifier
 * @param {string} appName - The app display name
 */
export const trackAppInstall = (appId, appName) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'app_install_click',
      app_id: appId,
      app_name: appName
    });
  }
};

/**
 * Push a pack creation event to GTM dataLayer
 * @param {string} packId - The pack identifier
 * @param {number} appCount - Number of apps in the pack
 */
export const trackPackCreated = (packId, appCount) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'pack_created',
      pack_id: packId,
      app_count: appCount
    });
  }
};

/**
 * Push a pack share event to GTM dataLayer
 * @param {string} packId - The pack identifier
 * @param {string} shareMethod - How the pack was shared (e.g., 'twitter', 'copy_link')
 */
export const trackPackShared = (packId, shareMethod) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'pack_shared',
      pack_id: packId,
      share_method: shareMethod
    });
  }
};

/**
 * Push a generic custom event to GTM dataLayer
 * @param {string} eventName - The event name
 * @param {Object} eventData - Additional event data
 */
export const trackCustomEvent = (eventName, eventData = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventData
    });
  }
};
