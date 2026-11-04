const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const babel = require('next/dist/compiled/babel/core');

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

test('installer route catches unhandled errors and returns sanitized 500 with correlationId', async (t) => {
  const origBase = process.env.WINSTALL_BUILDER_BASE;
  process.env.WINSTALL_BUILDER_BASE = 'http://127.0.0.1:8000';
  t.after(() => {
    process.env.WINSTALL_BUILDER_BASE = origBase;
  });

  const installerHandler = loadNextApiRoute(require.resolve('../pages/api/installer.js'));

  const origError = console.error;
  let loggedOutput = [];
  console.error = (...args) => {
    loggedOutput.push(args.join(' '));
  };
  t.after(() => {
    console.error = origError;
  });

  const req = {
    method: 'POST',
    get body() {
      throw new Error('Fatal internal database cluster connection timeout at 10.240.0.8');
    },
  };
  const res = createMockRes();

  await installerHandler(req, res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.data.error, 'An unexpected error occurred while processing your request.');
  assert.match(res.data.correlationId, UUID_V4_REGEX);
  assert.equal(JSON.stringify(res.data).includes('10.240.0.8'), false);

  const errorLog = loggedOutput.find((line) => line.includes(res.data.correlationId));
  assert.ok(errorLog, 'Server log must contain the correlationId');
  assert.ok(errorLog.includes('Route Error'), 'Server log must record Route Error');
});

test('installer/status route catches unhandled errors and returns sanitized 500 with correlationId', async (t) => {
  const statusHandler = loadNextApiRoute(require.resolve('../pages/api/installer/status.js'));

  const origError = console.error;
  let loggedOutput = [];
  console.error = (...args) => {
    loggedOutput.push(args.join(' '));
  };
  t.after(() => {
    console.error = origError;
  });

  const redisModule = require('../utils/redisClient.js');
  await redisModule.initRedisClient();
  const client = redisModule.getClient();
  const origGet = client.get;
  client.get = () => {
    throw new Error('Redis connection timed out to internal-redis.prod.local:6379');
  };
  t.after(() => {
    client.get = origGet;
  });

  const req = {
    method: 'GET',
    query: { taskId: 'test-task-123' },
  };
  const res = createMockRes();

  await statusHandler(req, res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.data.error, 'Failed to retrieve installer status.');
  assert.match(res.data.correlationId, UUID_V4_REGEX);
  assert.equal(JSON.stringify(res.data).includes('internal-redis.prod.local'), false);

  const errorLog = loggedOutput.find((line) => line.includes(res.data.correlationId));
  assert.ok(errorLog, 'Server log must contain the correlationId');
  assert.ok(errorLog.includes('Status Error'), 'Server log must record Status Error');
});

test('installer/callback route catches unhandled errors and returns sanitized 500 with correlationId', async (t) => {
  const callbackHandler = loadNextApiRoute(require.resolve('../pages/api/installer/callback.js'));

  const origError = console.error;
  let loggedOutput = [];
  console.error = (...args) => {
    loggedOutput.push(args.join(' '));
  };
  t.after(() => {
    console.error = origError;
  });

  const redisModule = require('../utils/redisClient.js');
  await redisModule.initRedisClient();
  const client = redisModule.getClient();
  const origGet = client.get;
  client.get = () => {
    throw new Error('Sensitive cluster auth secret mismatch in internal redis cluster');
  };
  t.after(() => {
    client.get = origGet;
  });

  const req = {
    method: 'GET',
    query: { taskId: 'test-task-456' },
  };
  const res = createMockRes();

  await callbackHandler(req, res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.data.error, 'Callback processing failed.');
  assert.match(res.data.correlationId, UUID_V4_REGEX);
  assert.equal(JSON.stringify(res.data).includes('Sensitive cluster auth secret'), false);

  const errorLog = loggedOutput.find((line) => line.includes(res.data.correlationId));
  assert.ok(errorLog, 'Server log must contain the correlationId');
  assert.ok(errorLog.includes('Callback Error'), 'Server log must record Callback Error');
});
