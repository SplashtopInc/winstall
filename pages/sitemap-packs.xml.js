import fetchWinstallAPI from "../utils/fetchWinstallAPI";

function generatePacksSiteMap(urlPrefix, packs, users) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${packs
       .map(({ _id, updatedAt }) => {
         return `
       <url>
           <loc>${urlPrefix}/packs/${_id}</loc>
           <lastmod>${updatedAt}</lastmod>
       </url>
     `;
       })
       .join('')}
     ${users
       .map((id) => {
         return `
       <url>
           <loc>${urlPrefix}/users/${id}</loc>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function PacksSiteMap() {
}

export async function getServerSideProps({ req, res }) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['host'];
  const urlPrefix = protocol + "://" + host;

  const limit = 500;
  let allPacks = [];
  let offset = 0;
  let total = 0;

  do {
    let { response: packsData, error: err } = await fetchWinstallAPI(`/packs?limit=${limit}&offset=${offset}`);
    if (err || !packsData?.data) {
      console.error('[sitemap-packs] Failed to fetch packs:', err || 'Invalid response');
      res.statusCode = 500;
      res.end('Error generating sitemap');
      return { props: {} };
    }

    allPacks = allPacks.concat(packsData.data);
    total = packsData.total;
    offset += limit;
  } while (offset < total);

  const users = Array.from(new Set(allPacks.map(pack => pack.creator)));
  const sitemap = generatePacksSiteMap(urlPrefix, allPacks, users);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default PacksSiteMap;
