const withSerwist = require("@serwist/next").default({
  swSrc: "sw/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

module.exports = withSerwist({
  // Enable standalone mode for Docker builds only
  ...(process.env.STANDALONE_BUILD === "true" && { output: "standalone" }),
});
