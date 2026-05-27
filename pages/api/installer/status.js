const { initRedisClient, getClient } = require('../../../utils/redisClient');
const { initS3Client, generateGetPresignedUrl } = require('../../../utils/s3Client');

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
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { taskId, fileName } = req.query;

	if (!taskId) {
		return res.status(400).json({ error: 'taskId is required' });
	}

	await ensureClientsInitialized();

	const redisClient = getClient();
	const cacheKey = `installer:task:${taskId}`;

	try {
		const uploaded = await redisClient.get(cacheKey);

		if (uploaded === null) {
			return res.status(404).json({ error: 'Task not found or expired' });
		}

		if (uploaded === '0') {
			const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
			const host = req.headers.host;
			const statusUrl = new URL(`${protocol}://${host}/api/installer/status`);
			statusUrl.searchParams.set('taskId', taskId);
			if (fileName) statusUrl.searchParams.set('fileName', fileName);

			return res.status(202).json({
				message: 'Processing',
				statusUrl: statusUrl.toString(),
			});
		}

		const downloadUrl = await generateGetPresignedUrl(taskId, fileName || `winstall-${taskId}.exe`, 3600);
		if (!downloadUrl) {
			return res.status(500).json({ error: 'S3 not configured, cannot generate download URL' });
		}
		console.log('[Installer] S3 GetPresignUrl:', JSON.stringify(downloadUrl));

		return res.status(200).json({
			downloadUrl,
			uploadedAt: parseInt(uploaded, 10),
		});
	} catch (error) {
		console.error('[Installer] Status Error:', error);
		return res.status(500).json({ error: error.message });
	}
}
