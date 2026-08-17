import Error from "../components/Error";
import MetaTags from "../components/MetaTags";
import { getDocumentShellStaticProps } from "../utils/documentShellStaticProps";

export default function Custom404() {
  return (
    <>
      <MetaTags title="Not found | winstall" />
      <Error notFound showRetry={false} />
    </>
  )
}

export async function getStaticProps() {
  return getDocumentShellStaticProps();
}
