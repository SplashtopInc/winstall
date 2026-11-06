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
    statusCode: null,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.data = body;
      return this;
    },
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    send(body) {
      this.data = body;
      return this;
    },
  };
}

test('callback and status routes handle 64-character hash taskId correctly', async (t) => {
  const origBucket = process.env.AWS_S3_BUCKET;
  const origKey = process.env.AWS_ACCESS_KEY_ID;
  const origSecret = process.env.AWS_ACCESS_KEY_SECRET;

  process.env.AWS_S3_BUCKET = 'mock-bucket';
  process.env.AWS_ACCESS_KEY_ID = 'mock-key';
  process.env.AWS_ACCESS_KEY_SECRET = 'mock-secret';

  t.after(() => {
    process.env.AWS_S3_BUCKET = origBucket;
    process.env.AWS_ACCESS_KEY_ID = origKey;
    process.env.AWS_ACCESS_KEY_SECRET = origSecret;
    delete require.cache[require.resolve('../utils/s3Client')];
  });

  const s3ClientModule = require('../utils/s3Client');
  s3ClientModule.initS3Client();

  const { initRedisClient, getClient } = require('../utils/redisClient');
  await initRedisClient();
  const redis = getClient();

  const hashTaskId = 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0';
  const cacheKey = `installer:task:${hashTaskId}`;

  // 1. Initially mark as '0' (in progress)
  await redis.setEx(cacheKey, 3600, '0');

  const statusHandler = loadNextApiRoute(require.resolve('../pages/api/installer/status.js'));
  const callbackHandler = loadNextApiRoute(require.resolve('../pages/api/installer/callback.js'));

  // 2. Status while in progress -> 202
  const statusReq1 = {
    method: 'GET',
    headers: { host: 'localhost:3000' },
    query: { taskId: hashTaskId, fileName: 'test.exe' },
  };
  const statusRes1 = createMockRes();
  await statusHandler(statusReq1, statusRes1);
  assert.equal(statusRes1.statusCode, 202);
  assert.equal(statusRes1.data.message, 'Processing');

  // 3. Callback called -> updates status
  const callbackReq = {
    method: 'GET',
    query: { taskId: hashTaskId },
  };
  const callbackRes = createMockRes();
  await callbackHandler(callbackReq, callbackRes);
  assert.equal(callbackRes.statusCode, 200);
  assert.equal(callbackRes.data.success, true);

  // 4. Status after callback -> 200 with downloadUrl
  const statusReq2 = {
    method: 'GET',
    headers: { host: 'localhost:3000' },
    query: { taskId: hashTaskId, fileName: 'test.exe' },
  };
  const statusRes2 = createMockRes();
  await statusHandler(statusReq2, statusRes2);
  assert.equal(statusRes2.statusCode, 200);
  assert.equal(typeof statusRes2.data.downloadUrl, 'string');
  assert.equal(typeof statusRes2.data.uploadedAt, 'number');
});
