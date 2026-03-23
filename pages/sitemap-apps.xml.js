import fetchWinstallAPI from "../utils/fetchWinstallAPI";

const escapeXml = (str) => {
  return str.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return char;
    }
  });
};

function generateAppsSiteMap(urlPrefix, apps) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${apps
       .map(({ _id, updatedAt }) => {
         return `
       <url>
           <loc>${urlPrefix}/apps/${escapeXml(_id)}</loc>
           <lastmod>${updatedAt}</lastmod>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function AppsSiteMap() {
}

export async function getServerSideProps({ req, res }) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['host'];
  const urlPrefix = protocol + "://" + host;

  const limit = 500;
  let allApps = [];
  let offset = 0;
  let total = 0;

  do {
    let { response: appsData, error: err } = await fetchWinstallAPI(`/apps?limit=${limit}&offset=${offset}`);
    if (err || !appsData?.data) {
      console.error('[sitemap-apps] Failed to fetch apps:', err || 'Invalid response');
      res.statusCode = 500;
      res.end('Error generating sitemap');
      return { props: {} };
    }

    allApps = allApps.concat(appsData.data);
    total = appsData.total;
    offset += limit;
  } while (offset < total);

  const sitemap = generateAppsSiteMap(urlPrefix, allApps);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default AppsSiteMap;
