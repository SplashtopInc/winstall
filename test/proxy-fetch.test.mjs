/**
 * Integration tests for utils/proxyConfig.js behavior with native fetch.
 *
 * Goal: verify configureProxy() auto-loads env proxy vars and applies a global
 * dispatcher so Node.js built-in fetch uses proxy settings.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import { getGlobalDispatcher, setGlobalDispatcher } from 'undici';

function pickEnv() {
  return {
    HTTP_PROXY: process.env.HTTP_PROXY,
    HTTPS_PROXY: process.env.HTTPS_PROXY,
    NO_PROXY: process.env.NO_PROXY,
    http_proxy: process.env.http_proxy,
    https_proxy: process.env.https_proxy,
    no_proxy: process.env.no_proxy,
    NODE_ENV: process.env.NODE_ENV,
  };
}

function restoreEnv(snapshot) {
  for (const [key, value] of Object.entries(snapshot)) {
    if (value === undefined) {
      delete process.env[key];
      continue;
    }
    process.env[key] = value;
  }
}

function clearProxyEnv() {
  delete process.env.HTTP_PROXY;
  delete process.env.HTTPS_PROXY;
  delete process.env.NO_PROXY;
  delete process.env.http_proxy;
  delete process.env.https_proxy;
  delete process.env.no_proxy;
}

/** Use ephemeral ports so tests are isolated and do not depend on local machine state. */
function startTargetServer(handler) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(handler);
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

/**
 * Support both proxy styles because undici behavior differs by protocol/runtime version.
 * This keeps the test stable while still proving requests pass through the proxy layer.
 */
function startProxy() {
  const received = [];

  // Accept forwarded HTTP requests so the test does not assume CONNECT for plain HTTP.
  const server = http.createServer((req, res) => {
    received.push(req.url); // Keep evidence of proxy traversal for assertions.
    const targetUrl = new URL(req.url);
    const proxyReq = http.request({
      hostname: targetUrl.hostname,
      port: targetUrl.port || 80,
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: req.headers,
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    proxyReq.once('error', () => res.destroy());
    req.pipe(proxyReq);
  });

  // Accept CONNECT tunneling to cover HTTPS and older undici HTTP behavior.
  server.on('connect', (req, clientSocket, head) => {
    received.push(req.url); // "hostname:port"
    const [hostname, portStr] = req.url.split(':');
    const serverSocket = net.connect(parseInt(portStr, 10), hostname, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head.length) serverSocket.write(head);
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });
    serverSocket.once('error', () => clientSocket.destroy());
    clientSocket.once('error', () => serverSocket.destroy());
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () =>
      resolve({ server, port: server.address().port, received })
    );
  });
}

test('native fetch routes through HTTP_PROXY after configureProxy()', { concurrency: false }, async (t) => {
  const prevDispatcher = getGlobalDispatcher();
  const prevEnv = pickEnv();
  clearProxyEnv();

  const { server: targetServer, port: targetPort } = await startTargetServer((req, res) => {
    res.end('target-ok');
  });
  const { server: proxyServer, port: proxyPort, received } = await startProxy();

  t.after(() => {
    targetServer.close();
    proxyServer.close();
    setGlobalDispatcher(prevDispatcher);
    restoreEnv(prevEnv);
  });

  process.env.HTTP_PROXY = `http://127.0.0.1:${proxyPort}`;
  const { configureProxy } = await import(`../utils/proxyConfig.js?case=http_${Date.now()}`);
  configureProxy();

  const res = await fetch(`http://127.0.0.1:${targetPort}/ping`);
  const body = await res.text();

  assert.equal(res.status, 200);
  assert.equal(body, 'target-ok');
  assert.equal(received.length, 1, 'proxy should have received exactly one request');
  // Match both formats so the assertion encodes intent (proxy traversal) instead of transport details.
  assert.ok(
    received[0].includes(`127.0.0.1:${targetPort}`),
    `proxy request should reference target host:port, got: ${received[0]}`
  );
});

test('configureProxy() auto-loads HTTPS_PROXY in test env and installs dispatcher', { concurrency: false }, async (t) => {
  const prevDispatcher = getGlobalDispatcher();
  const prevEnv = pickEnv();

  clearProxyEnv();
  process.env.NODE_ENV = 'test';
  process.env.HTTPS_PROXY = 'http://127.0.0.1:65535';

  t.after(() => {
    setGlobalDispatcher(prevDispatcher);
    restoreEnv(prevEnv);
  });

  const before = getGlobalDispatcher();
  await import(`../utils/proxyConfig.js?case=https_${Date.now()}`);
  const after = getGlobalDispatcher();

  assert.notEqual(after, before, 'global dispatcher should be replaced when HTTPS_PROXY is present');
  assert.equal(
    after.constructor?.name,
    'EnvHttpProxyAgent',
    'global dispatcher should be EnvHttpProxyAgent when HTTPS_PROXY is configured'
  );
});

test('configureProxy() is callable without throwing', { concurrency: false }, async () => {
  const prevEnv = pickEnv();
  clearProxyEnv();

  try {
    const { configureProxy } = await import(`../utils/proxyConfig.js?case=callable_${Date.now()}`);
    // Repeated calls must stay safe because this initializer can run from multiple startup paths.
    assert.doesNotThrow(() => {
      configureProxy();
      configureProxy();
    });
  } finally {
    restoreEnv(prevEnv);
  }
});
