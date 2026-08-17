import { getRuntimeConfig } from "./runtimeConfig";

/**
 * Empty ISR shell so `_document` can re-run at runtime and pick up
 * WINSTALL_API_BASE (unset at Docker build). Does not load page data.
 */
export async function getDocumentShellStaticProps() {
  const config = await getRuntimeConfig();

  return {
    props: {},
    revalidate: config.apiBase ? 600 : 1,
  };
}
