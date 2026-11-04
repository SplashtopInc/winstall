const { randomUUID } = require('node:crypto');
const { initRedisClient, getClient } = require('../../../utils/redisClient');

let redisInitialized = false;

async function ensureClientsInitialized() {
	if (!redisInitialized) {
		await initRedisClient();
		redisInitialized = true;
	}
}

export default async function handler(req, res) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { taskId } = req.query;

	if (!taskId) {
		return res.status(400).json({ error: 'taskId is required' });
	}

	await ensureClientsInitialized();

	const redisClient = getClient();
	const cacheKey = `installer:task:${taskId}`;

	try {
		const exists = await redisClient.get(cacheKey);

		if (exists === null) {
			return res.status(404).json({ error: 'Task not found' });
		}

		const uploadedAt = Math.floor(Date.now() / 1000);
		await redisClient.setEx(cacheKey, 3600, uploadedAt.toString());

		console.log(`[Installer] Task ${taskId} uploaded at ${uploadedAt}`);

		return res.status(200).json({ success: true });
	} catch (error) {
		const correlationId = randomUUID();
		console.error(`[Installer][Error ID: ${correlationId}] Callback Error:`, error);
		return res.status(500).json({
			error: 'Callback processing failed.',
			correlationId,
		});
	}
}
