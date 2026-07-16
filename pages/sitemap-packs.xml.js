const escapeXml = (str) => {
  return String(str).replace(/[&<>"']/g, (char) => {
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

function generatePacksSiteMap(urlPrefix, packs, users) {
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
       .join('')}
     ${users
       .map((id) => {
         return `
       <url>
           <loc>${urlPrefix}/users/${escapeXml(id)}</loc>
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

  try {
    // Query packs from local MongoDB
    const { connectMongoose } = require('../lib/mongoose');
    const mongoose = await connectMongoose();

    // Import Pack model to register it
    require('../dbModel/Pack');
    const Pack = mongoose.models.Pack;
    const allPacks = await Pack.find({
      visibility: 'public',
      status: 'active'
    })
      .sort({ createdAt: -1 })
      .select('_id userId updatedAt')
      .lean();

    const users = Array.from(new Set(allPacks.map(pack => pack.userId)));
    const sitemap = generatePacksSiteMap(urlPrefix, allPacks, users);

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();
  } catch (err) {
    console.error('[sitemap-packs] Failed to generate sitemap:', err.message);
    res.statusCode = 500;
    res.end('Error generating sitemap');
  }

  return {
    props: {},
  };
}

export default PacksSiteMap;
