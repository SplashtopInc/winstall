/**
 * Centralize proxy behavior so every fetch call follows one environment-driven rule.
 * This avoids per-call proxy wiring and keeps runtime behavior consistent.
 */

import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";

let proxyConfigured = false;

export function configureProxy() {
  if (proxyConfigured) return;

  const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY ||
                   process.env.http_proxy || process.env.https_proxy;

  if (!proxyUrl) {
    return;
  }

  // Use env-aware proxy resolution so runtime config can stay outside application code.
  const envHttpProxyAgent = new EnvHttpProxyAgent();
  setGlobalDispatcher(envHttpProxyAgent);

  proxyConfigured = true;
}

// Configure eagerly in dev/test to keep local behavior close to production startup.
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  configureProxy();
}
