const { v4: uuidv4 } = require('uuid');
const { initRedisClient, getClient } = require('../../utils/redisClient');
const { initS3Client, generatePutPresignedUrl } = require('../../utils/s3Client');

let redisInitialized = false;
let s3Initialized = false;

async function ensureClientsInitialized() {
	if (!redisInitialized) {
		await initRedisClient();
		redisInitialized = true;
	}
	if (!s3Initialized) {
		initS3Client();
		s3Initialized = true;
	}
}

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const installBase = process.env.WINSTALL_INSTALLER_BASE;

	if (!installBase) {
		return res.status(500).json({ error: 'Installer service not configured' });
	}

	await ensureClientsInitialized();

	const taskId = uuidv4();
	const redisClient = getClient();
	const cacheKey = `installer:task:${taskId}`;

	try {
		await redisClient.setEx(cacheKey, 3600, '0');

		const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
		const host = req.headers.host;
		const { config, filename } = req.body;
		const payload = {
			config,
		};

		const uploadUrl = await generatePutPresignedUrl(taskId, 900);
		if (uploadUrl) {
			console.log('[Installer] S3 PutPresignUrl:', JSON.stringify(uploadUrl));

			const callbackUrl = `${protocol}://${host}/api/installer/callback?taskId=${taskId}`;
			console.log('[Installer] CallbackUrl:', callbackUrl);

			payload.upload = {
				upload_url: uploadUrl,
				callback_url: callbackUrl,
			};
		}

		const url = `${installBase}/installer`;
		if (process.env.NODE_ENV === 'development') {
			console.log('[Installer] Config:', JSON.stringify(payload, null, 2));
		}

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		const contentType = response.headers.get('content-type');

		if (contentType?.includes('application/octet-stream')) {
			const buffer = await response.arrayBuffer();

			res.setHeader('Content-Type', 'application/octet-stream');

			await redisClient.del(cacheKey);

			return res.status(200).send(Buffer.from(buffer));
		}

		const statusUrlObj = new URL(`${protocol}://${host}/api/installer/status`);
		statusUrlObj.searchParams.set('taskId', taskId);
		if (filename) statusUrlObj.searchParams.set('fileName', filename);
		const statusUrl = statusUrlObj.toString();

		return res.status(202).json({
			taskId,
			statusUrl,
			message: 'Installer generation in progress',
		});
	} catch (error) {
		console.error('[Installer] Error:', error);

		try {
			await redisClient.del(cacheKey);
		} catch (cleanupError) {
			console.error('[Installer] Cleanup error:', cleanupError);
		}

		return res.status(500).json({ error: error.message });
	}
}
