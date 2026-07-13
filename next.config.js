const withSerwist = require("@serwist/next").default({
  swSrc: "sw/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

module.exports = withSerwist({
  // For security, hide X-Powered-By header, avoid leak tech stack
  poweredByHeader: false,
  // Enable standalone mode for Docker builds only
  ...(process.env.STANDALONE_BUILD === "true" && { output: "standalone" }),
});
