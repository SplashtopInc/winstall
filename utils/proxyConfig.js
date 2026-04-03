/**
 * Global proxy configuration for development
 * Sets up undici's GlobalDispatcher with smart NO_PROXY support
 */

import { ProxyAgent, Agent, setGlobalDispatcher } from "undici";

let proxyConfigured = false;

export function configureProxy() {
  if (proxyConfigured) return;

  const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
  if (!proxyUrl) {
    proxyConfigured = true;
    return;
  }

  const noProxyList = (process.env.NO_PROXY || process.env.no_proxy || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  class SmartProxyAgent extends ProxyAgent {
    dispatch(opts, handler) {
      const url = new URL(opts.origin);
      const hostname = url.hostname;

      const shouldBypass = noProxyList.some(pattern => {
        if (pattern.startsWith(".")) {
          return hostname === pattern.slice(1) || hostname.endsWith(pattern);
        }
        return hostname === pattern ||
               hostname === "localhost" ||
               hostname === "127.0.0.1" ||
               hostname.startsWith("192.168.") ||
               hostname.startsWith("10.") ||
               hostname.startsWith("172.16.");
      });

      if (shouldBypass) {
        return new Agent().dispatch(opts, handler);
      }

      return super.dispatch(opts, handler);
    }
  }

  setGlobalDispatcher(new SmartProxyAgent({ uri: proxyUrl }));
  proxyConfigured = true;
}

// Auto-configure in development
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  configureProxy();
}
