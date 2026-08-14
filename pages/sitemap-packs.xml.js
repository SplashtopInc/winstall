const escapeXml = (str) => {
  return String(str).replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return char;
    }
  });
};

function generatePacksSiteMap(urlPrefix, packs) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${packs
       .map(({ _id, updatedAt }) => {
         return `
       <url>
           <loc>${urlPrefix}/packs/${escapeXml(_id)}</loc>
           <lastmod>${updatedAt}</lastmod>
       </url>
     `;
       })
       .join("")}
   </urlset>
 `;
}

function PacksSiteMap() {}

export async function getServerSideProps({ req, res }) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["host"];
  const urlPrefix = protocol + "://" + host;

  try {
    const { fetchAllPublicPacksFromApi } = require("../utils/packApiServer");
    const { packs, error } = await fetchAllPublicPacksFromApi({
      limit: 100,
      sort: "recent",
    });
    if (error) {
      throw new Error(error);
    }

    const allPacks = (packs || []).map((pack) => ({
      _id: pack._id,
      updatedAt: pack.updatedAt,
    }));
    const sitemap = generatePacksSiteMap(urlPrefix, allPacks);

    res.setHeader("Content-Type", "text/xml");
    res.write(sitemap);
    res.end();
  } catch (err) {
    console.error("[sitemap-packs] Failed to generate sitemap:", err.message);
    res.statusCode = 500;
    res.end("Error generating sitemap");
  }

  return {
    props: {},
  };
}

export default PacksSiteMap;
