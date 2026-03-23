function generateSiteMapIndex(urlPrefix) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <sitemap>
       <loc>${urlPrefix}/sitemap-static.xml</loc>
     </sitemap>
     <sitemap>
       <loc>${urlPrefix}/sitemap-apps.xml</loc>
     </sitemap>
     <sitemap>
       <loc>${urlPrefix}/sitemap-packs.xml</loc>
     </sitemap>
   </sitemapindex>
 `;
}

function SiteMap() {
}

export async function getServerSideProps({ req, res }) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['host'];
  const urlPrefix = protocol + "://" + host;

  const sitemap = generateSiteMapIndex(urlPrefix);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;