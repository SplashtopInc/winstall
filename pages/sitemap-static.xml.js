function generateStaticSiteMap(urlPrefix) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${['apps', 'packs', 'eli5']
       .map((page) => {
         return `
       <url>
           <loc>${urlPrefix}/${page}</loc>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function StaticSiteMap() {
}

export async function getServerSideProps({ req, res }) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['host'];
  const urlPrefix = protocol + "://" + host;

  const sitemap = generateStaticSiteMap(urlPrefix);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default StaticSiteMap;
