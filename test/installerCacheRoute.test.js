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
