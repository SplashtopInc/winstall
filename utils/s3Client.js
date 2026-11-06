// S3 client utilities for generating pre-signed URLs

const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

let s3Client = null;
let s3Bucket = null;

function initS3Client() {
  const bucket = process.env.AWS_S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_ACCESS_KEY_SECRET;
  const region = process.env.AWS_REGION || 'us-east-1';
  const endpoint = process.env.AWS_ENDPOINT;

  if (!bucket || !accessKeyId || !secretAccessKey) {
    console.log('[S3] S3 not configured, pre-signed URLs will not be generated');
    return null;
  }

  if (!s3Client) {
    const clientConfig = {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    // Support MinIO and S3-compatible services
    if (endpoint) {
      clientConfig.endpoint = endpoint;
      clientConfig.forcePathStyle = true; // Required for MinIO
      console.log(`[S3] Using custom endpoint: ${endpoint}`);
    }

    s3Client = new S3Client(clientConfig);
    s3Bucket = bucket;
    console.log('[S3] S3 client initialized');
  }

  return s3Client;
}

function isS3Configured() {
  return s3Client !== null && s3Bucket !== null;
}

async function generatePutPresignedUrl(taskId, expiresIn = 900) {
  if (!s3Client || !s3Bucket) {
    return null;
  }

  const key = `installers/${taskId}.exe`;

  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: key,
    ContentType: 'application/octet-stream',
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

async function generateGetPresignedUrl(taskId, filename = 'installer.exe', expiresIn = 3600) {
  if (!s3Client || !s3Bucket) {
    return null;
  }

  const key = `installers/${taskId}.exe`;

  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

async function checkS3FileExists(taskId) {
  if (!s3Client || !s3Bucket) {
    return false;
  }

  const key = `installers/${taskId}.exe`;

  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: s3Bucket,
      Key: key,
    }));
    return true;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw err;
  }
}

module.exports = {
  initS3Client,
  isS3Configured,
  generatePutPresignedUrl,
  generateGetPresignedUrl,
  checkS3FileExists,
};
