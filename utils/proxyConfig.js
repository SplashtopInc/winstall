/**
 * Global proxy configuration for development
 * Sets up undici's EnvHttpProxyAgent to handle HTTP_PROXY & NO_PROXY automatically
 */

import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";

let proxyConfigured = false;

export function configureProxy() {
  if (proxyConfigured) return;

  const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY ||
                   process.env.http_proxy || process.env.https_proxy;

  if (!proxyUrl) {
    proxyConfigured = true;
    return;
  }

  // EnvHttpProxyAgent 自动处理:
  // - HTTP_PROXY / HTTPS_PROXY / http_proxy / https_proxy
  // - NO_PROXY / no_proxy (支持 localhost, IP, CIDR, 域名通配符)
  const envHttpProxyAgent = new EnvHttpProxyAgent();
  setGlobalDispatcher(envHttpProxyAgent);

  proxyConfigured = true;
}

// Auto-configure in development
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  configureProxy();
}
