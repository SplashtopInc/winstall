const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('native crypto.randomUUID produces standard RFC 4122 v4 UUID format', () => {
  const id = randomUUID();
  assert.equal(typeof id, 'string');
  assert.equal(id.length, 36);
  assert.match(id, UUID_V4_REGEX);
});

test('multiple randomUUID calls generate unique task identifiers', () => {
  const ids = new Set(Array.from({ length: 50 }, () => randomUUID()));
  assert.equal(ids.size, 50);
});
