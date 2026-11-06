const { createHash } = require('node:crypto');

/**
 * Deterministically serializes a value into a canonical JSON string.
 * - Objects have their keys recursively sorted alphabetically.
 * - Arrays maintain their existing element order.
 * - Primitive values use standard JSON serialization.
 *
 * @param {*} value
 * @returns {string}
 */
function canonicalStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return '[' + value.map(canonicalStringify).join(',') + ']';
  }

  const keys = Object.keys(value).sort();
  const entries = keys.map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`);
  return '{' + entries.join(',') + '}';
}

/**
 * Computes a deterministic SHA-256 hash identifying the installer build payload.
 *
 * @param {object} params
 * @param {string} [params.projectName]
 * @param {string} [params.version]
 * @param {string} [params.rcUpdateId]
 * @param {*} params.config
 * @returns {string}
 */
function computeInstallerHash({
  projectName = process.env.WINSTALL_BUILDER_PROJECT_NAME || 'Winstall_Installer_Builder',
  version = process.env.WINSTALL_BUILDER_VERSION || 'v0.9.1.0',
  rcUpdateId = process.env.WINSTALL_BUILDER_RC_UPDATE_ID || '129',
  config,
} = {}) {
  const serializedConfig = canonicalStringify(config);
  const payload = [projectName, version, rcUpdateId, serializedConfig].join('::');
  return createHash('sha256').update(payload).digest('hex');
}

module.exports = {
  canonicalStringify,
  computeInstallerHash,
};
