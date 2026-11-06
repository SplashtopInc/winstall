const test = require('node:test');
const assert = require('node:assert/strict');
const { canonicalStringify, computeInstallerHash } = require('../utils/installerHash');

test('canonicalStringify produces identical output regardless of object key insertion order', () => {
  const obj1 = { b: 1, a: 2, c: { y: 'bar', x: 'foo' } };
  const obj2 = { a: 2, c: { x: 'foo', y: 'bar' }, b: 1 };

  assert.equal(canonicalStringify(obj1), canonicalStringify(obj2));
  assert.equal(canonicalStringify(obj1), '{"a":2,"b":1,"c":{"x":"foo","y":"bar"}}');
});

test('canonicalStringify preserves array order without sorting array items', () => {
  const arr1 = [{ id: 'second', name: 'B' }, { id: 'first', name: 'A' }];
  const arr2 = [{ name: 'B', id: 'second' }, { name: 'A', id: 'first' }];

  // Object keys inside elements are canonicalized, but array item order is preserved
  assert.equal(canonicalStringify(arr1), canonicalStringify(arr2));

  const differentOrder = [{ id: 'first', name: 'A' }, { id: 'second', name: 'B' }];
  assert.notEqual(canonicalStringify(arr1), canonicalStringify(differentOrder));
});

test('computeInstallerHash produces identical SHA-256 for identical configurations with different key order', () => {
  const config1 = {
    version: '0.0.1',
    apps: [
      { id: 'app1', name: 'App One', options: { silent: true } },
      { id: 'app2', name: 'App Two', options: { force: true, silent: true } },
    ],
  };

  const config2 = {
    apps: [
      { name: 'App One', id: 'app1', options: { silent: true } },
      { options: { silent: true, force: true }, name: 'App Two', id: 'app2' },
    ],
    version: '0.0.1',
  };

  const hash1 = computeInstallerHash({ config: config1 });
  const hash2 = computeInstallerHash({ config: config2 });

  assert.equal(typeof hash1, 'string');
  assert.equal(hash1.length, 64);
  assert.equal(hash1, hash2);
});

test('computeInstallerHash produces different hash when binary env variables change', () => {
  const config = { version: '0.0.1', apps: [] };

  const baseHash = computeInstallerHash({
    projectName: 'ProjA',
    version: 'v1.0.0',
    rcUpdateId: '129',
    config,
  });

  const changedVersionHash = computeInstallerHash({
    projectName: 'ProjA',
    version: 'v1.0.1',
    rcUpdateId: '129',
    config,
  });

  const changedRcHash = computeInstallerHash({
    projectName: 'ProjA',
    version: 'v1.0.0',
    rcUpdateId: '130',
    config,
  });

  assert.notEqual(baseHash, changedVersionHash);
  assert.notEqual(baseHash, changedRcHash);
});
