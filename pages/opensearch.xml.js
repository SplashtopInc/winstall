function generateOpenSearchXML(urlPrefix) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>winstall</ShortName>
  <Description>Search Windows apps on winstall</Description>
  <Url type="text/html" template="${urlPrefix}/apps?q={searchTerms}"/>
  <Image height="64" width="64" type="image/png">${urlPrefix}/logo192.png</Image>
  <InputEncoding>UTF-8</InputEncoding>
</OpenSearchDescription>`;
}

function OpenSearch() {
}

export async function getServerSideProps({ req, res }) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['host'];
  const urlPrefix = protocol + "://" + host;

  const xml = generateOpenSearchXML(urlPrefix);

  res.setHeader('Content-Type', 'application/opensearchdescription+xml');
  res.write(xml);
  res.end();

  return {
    props: {},
  };
}

export default OpenSearch;
