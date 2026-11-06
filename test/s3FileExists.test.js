const test = require('node:test');
const assert = require('node:assert/strict');
const { checkS3FileExists } = require('../utils/s3Client');

test('checkS3FileExists returns false when S3 is not configured', async () => {
  const exists = await checkS3FileExists('non-existent-task-id');
  assert.equal(exists, false);
});

test('checkS3FileExists handles HeadObjectCommand response and errors', async () => {
  // Mock S3 environment
  const originalEnv = { ...process.env };
  process.env.AWS_S3_BUCKET = 'test-bucket';
  process.env.AWS_ACCESS_KEY_ID = 'test-key';
  process.env.AWS_ACCESS_KEY_SECRET = 'test-secret';

  // Clear require cache to reinitialize module with mock client
  delete require.cache[require.resolve('../utils/s3Client')];
  const s3ClientModule = require('../utils/s3Client');
  s3ClientModule.initS3Client();

  const mockS3Client = s3ClientModule.initS3Client();

  // Test 1: object exists
  mockS3Client.send = async (command) => {
    assert.equal(command.input.Bucket, 'test-bucket');
    assert.equal(command.input.Key, 'installers/test-task-1.exe');
    return {};
  };

  const exists = await s3ClientModule.checkS3FileExists('test-task-1');
  assert.equal(exists, true);

  // Test 2: object does not exist (NotFound name)
  mockS3Client.send = async () => {
    const error = new Error('Not found');
    error.name = 'NotFound';
    throw error;
  };
  const notFound1 = await s3ClientModule.checkS3FileExists('test-task-2');
  assert.equal(notFound1, false);

  // Test 3: object does not exist (404 status code)
  mockS3Client.send = async () => {
    const error = new Error('Not found');
    error.$metadata = { httpStatusCode: 404 };
    throw error;
  };
  const notFound2 = await s3ClientModule.checkS3FileExists('test-task-3');
  assert.equal(notFound2, false);

  // Restore env and cache
  process.env = originalEnv;
  delete require.cache[require.resolve('../utils/s3Client')];
});
