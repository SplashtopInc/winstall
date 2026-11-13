import Document, { Html, Head, Main, NextScript } from "next/document";
import GtmSnippet from "../components/gtmSnippet";
import { getPublicApiBase } from "../utils/runtimeConfig";
import { statsDisplayMetaContent } from "../utils/statsDisplay";

const GTM_CODE = "GTM-5JF42TD";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" data-scroll-behavior="smooth">
        <Head>
          <meta name="winstall-icon-base" content={process.env.WINSTALL_ICON_BASE || ''} />
          <meta name="winstall-api-base" content={getPublicApiBase()} />
          <meta name="winstall-show-stats" content={statsDisplayMetaContent()} />
          <script src="https://cmp.osano.com/169nu5TMub7Nk2Epy/7c82a576-285f-4b1c-8d4b-a1a4da5b7346/osano.js"></script>
          <GtmSnippet gtmCode={GTM_CODE} part="script" />
        </Head>
        <body>
          <GtmSnippet gtmCode={GTM_CODE} part="noscript" />
          <Main />
          <NextScript />
        </body>
        <a id="gsc" href="#" download="winstall.bat" style={{ display: 'none' }} />
        <link rel="manifest" href="/manifest.json" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Html>
    );
  }
}

export default MyDocument;
