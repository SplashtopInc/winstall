const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const babel = require('next/dist/compiled/babel/core');

function loadNextApiRoute(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const transformed = babel.transformSync(code, {
    filename: filePath,
    presets: ['next/babel'],
  });

  const m = new Module(filePath);
  m.filename = filePath;
  m.paths = Module._nodeModulePaths(filePath);
  m._compile(transformed.code, filePath);
  return m.exports.default;
}

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
    setHeader(k, v) {
      this.headers[k] = v;
      return this;
    },
  };
}

test('installer route returns 200 with downloadUrl immediately on S3 cache hit', async (t) => {
  const origBase = process.env.WINSTALL_BUILDER_BASE;
  const origBucket = process.env.AWS_S3_BUCKET;
  const origKey = process.env.AWS_ACCESS_KEY_ID;
  const origSecret = process.env.AWS_ACCESS_KEY_SECRET;

  process.env.WINSTALL_BUILDER_BASE = 'http://127.0.0.1:8000';
  process.env.AWS_S3_BUCKET = 'mock-bucket';
  process.env.AWS_ACCESS_KEY_ID = 'mock-key';
  process.env.AWS_ACCESS_KEY_SECRET = 'mock-secret';

  t.after(() => {
    process.env.WINSTALL_BUILDER_BASE = origBase;
    process.env.AWS_S3_BUCKET = origBucket;
    process.env.AWS_ACCESS_KEY_ID = origKey;
    process.env.AWS_ACCESS_KEY_SECRET = origSecret;
    delete require.cache[require.resolve('../utils/s3Client')];
  });

  const s3ClientModule = require('../utils/s3Client');
  const mockS3Client = s3ClientModule.initS3Client();

  // Mock HeadObject to simulate file existing in S3
  mockS3Client.send = async () => ({ ContentLength: 1024 });

  const installerHandler = loadNextApiRoute(require.resolve('../pages/api/installer.js'));

  const req = {
    method: 'POST',
    headers: { host: 'localhost:3000' },
    body: {
      config: { version: '0.0.1', apps: [{ id: 'test.app', name: 'Test' }] },
      filename: 'winstall-test_app.exe',
    },
  };
  const res = createMockRes();

  await installerHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.data.cached, true);
  assert.equal(typeof res.data.downloadUrl, 'string');
  assert.equal(typeof res.data.taskId, 'string');
});

test('installer route coalesces concurrent requests when task is already in progress', async (t) => {
  const origBase = process.env.WINSTALL_BUILDER_BASE;
  const origBucket = process.env.AWS_S3_BUCKET;
  const origKey = process.env.AWS_ACCESS_KEY_ID;
  const origSecret = process.env.AWS_ACCESS_KEY_SECRET;

  process.env.WINSTALL_BUILDER_BASE = 'http://127.0.0.1:8000';
  delete process.env.AWS_S3_BUCKET;
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_ACCESS_KEY_SECRET;

  t.after(() => {
    process.env.WINSTALL_BUILDER_BASE = origBase;
    process.env.AWS_S3_BUCKET = origBucket;
    process.env.AWS_ACCESS_KEY_ID = origKey;
    process.env.AWS_ACCESS_KEY_SECRET = origSecret;
  });

  const { initRedisClient, getClient } = require('../utils/redisClient');
  await initRedisClient();
  const redis = getClient();

  const { computeInstallerHash } = require('../utils/installerHash');
  const config = { version: '0.0.1', apps: [{ id: 'coalesce.app', name: 'Coalesce' }] };
  const taskId = computeInstallerHash({ config });

  // Mark task as currently in progress in Redis
  await redis.setEx(`installer:task:${taskId}`, 3600, '0');

  const installerHandler = loadNextApiRoute(require.resolve('../pages/api/installer.js'));

  const req = {
    method: 'POST',
    headers: { host: 'localhost:3000' },
    body: {
      config,
      filename: 'winstall-coalesce_app.exe',
    },
  };
  const res = createMockRes();

  await installerHandler(req, res);

  // Must return 202 without calling builder
  assert.equal(res.statusCode, 202);
  assert.equal(res.data.taskId, taskId);
  assert.equal(res.data.statusUrl.includes(taskId), true);
  assert.equal(res.data.message, 'Installer generation in progress');
});

test('installer route ignores untrusted host and proto headers for builder callback and status URLs', async (t) => {
  const origBase = process.env.WINSTALL_BUILDER_BASE;
  const origPublicUrl = process.env.WINSTALL_PUBLIC_URL;
  const origNextAuth = process.env.NEXTAUTH_URL;
  const origBucket = process.env.AWS_S3_BUCKET;
  const origKey = process.env.AWS_ACCESS_KEY_ID;
  const origSecret = process.env.AWS_ACCESS_KEY_SECRET;

  process.env.WINSTALL_PUBLIC_URL = 'https://canonical.winstall.app/';
  delete process.env.NEXTAUTH_URL;
  process.env.WINSTALL_BUILDER_BASE = 'http://127.0.0.1:8000';
  process.env.AWS_S3_BUCKET = 'mock-bucket';
  process.env.AWS_ACCESS_KEY_ID = 'mock-key';
  process.env.AWS_ACCESS_KEY_SECRET = 'mock-secret';

  const s3ClientModule = require('../utils/s3Client');
  const mockS3Client = s3ClientModule.initS3Client();
  mockS3Client.send = async (command) => {
    // If it's HeadObjectCommand, reject with NotFound to simulate file not cached
    if (command.constructor?.name === 'HeadObjectCommand' || command.input?.Key) {
      const err = new Error('NotFound');
      err.name = 'NotFound';
      throw err;
    }
    return {};
  };

  let interceptedPayload = null;
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    if (url.includes('/installer')) {
      interceptedPayload = JSON.parse(options.body);
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ status: 'queued' }),
        text: async () => JSON.stringify({ status: 'queued' }),
      };
    }
    return originalFetch(url, options);
  };

  t.after(() => {
    global.fetch = originalFetch;
    process.env.WINSTALL_BUILDER_BASE = origBase;
    if (origPublicUrl === undefined) delete process.env.WINSTALL_PUBLIC_URL;
    else process.env.WINSTALL_PUBLIC_URL = origPublicUrl;
    if (origNextAuth === undefined) delete process.env.NEXTAUTH_URL;
    else process.env.NEXTAUTH_URL = origNextAuth;
    process.env.AWS_S3_BUCKET = origBucket;
    process.env.AWS_ACCESS_KEY_ID = origKey;
    process.env.AWS_ACCESS_KEY_SECRET = origSecret;
  });

  const { initRedisClient, getClient } = require('../utils/redisClient');
  await initRedisClient();
  const redis = getClient();

  const { computeInstallerHash } = require('../utils/installerHash');
  const config = { version: '0.0.1', apps: [{ id: 'security.check', name: 'SecurityCheck' }] };
  const taskId = computeInstallerHash({ config });

  // Ensure task is not in cache/redis
  await redis.del(`installer:task:${taskId}`);

  const installerHandler = loadNextApiRoute(require.resolve('../pages/api/installer.js'));

  const req = {
    method: 'POST',
    headers: {
      host: '169.254.169.254/latest/meta-data/?',
      'x-forwarded-proto': 'gopher',
    },
    body: {
      config,
      filename: 'winstall-sec.exe',
    },
  };
  const res = createMockRes();

  await installerHandler(req, res);

  assert.equal(res.statusCode, 202);
  // statusUrl must use WINSTALL_PUBLIC_URL and must not contain the malicious host or scheme
  assert.equal(res.data.statusUrl.startsWith('https://canonical.winstall.app/api/installer/status'), true);
  assert.equal(res.data.statusUrl.includes('169.254.169.254'), false);
  assert.equal(res.data.statusUrl.includes('gopher'), false);

  // If upload payload exists, upload.callback_url must also strictly use canonical origin
  if (interceptedPayload?.upload?.callback_url) {
    const callbackUrl = interceptedPayload.upload.callback_url;
    assert.equal(callbackUrl.startsWith('https://canonical.winstall.app/api/installer/callback'), true);
    assert.equal(callbackUrl.includes('169.254.169.254'), false);
    assert.equal(callbackUrl.includes('gopher'), false);
  }
});
