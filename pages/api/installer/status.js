const { randomUUID } = require('node:crypto');
const { initRedisClient, getClient } = require('../../../utils/redisClient');
const { initS3Client, generateGetPresignedUrl } = require('../../../utils/s3Client');
const { getSiteOrigin } = require('../../../utils/helpers');

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
			const siteOrigin = getSiteOrigin();
			const statusUrlObj = siteOrigin ? new URL('/api/installer/status', siteOrigin) : new URL('/api/installer/status', 'http://localhost');
			statusUrlObj.searchParams.set('taskId', taskId);
			if (fileName) statusUrlObj.searchParams.set('fileName', fileName);
			const statusUrl = siteOrigin ? statusUrlObj.toString() : statusUrlObj.pathname + statusUrlObj.search;

			return res.status(202).json({
				message: 'Processing',
				statusUrl,
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
		const correlationId = randomUUID();
		console.error(`[Installer][Error ID: ${correlationId}] Status Error:`, error);
		return res.status(500).json({
			error: 'Failed to retrieve installer status.',
			correlationId,
		});
	}
}
