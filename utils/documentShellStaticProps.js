import { getPublicApiBase } from "./runtimeConfig";

/**
 * Empty ISR shell so `_document` can re-run at runtime and pick up
 * WINSTALL_API_BASE (unset at Docker build). Does not load page data.
 */
export async function getDocumentShellStaticProps() {
  return {
    props: {},
    revalidate: getPublicApiBase() ? 600 : 1,
  };
}
