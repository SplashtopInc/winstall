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

	const builderBase = process.env.WINSTALL_BUILDER_BASE;
	const builderWebhook = process.env.WINSTALL_BUILDER_WEBHOOK;

	if (!builderBase && !builderWebhook) {
		return res.status(500).json({ error: 'Installer builder not configured' });
	}

	await ensureClientsInitialized();

	const taskId = uuidv4();
	const redisClient = getClient();
	const cacheKey = `installer:task:${taskId}`;
	console.log('[Installer] TaskId:', taskId);

	try {
		await redisClient.setEx(cacheKey, 3600, '0');
		const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
		const host = req.headers.host;
		const { config, filename } = req.body;
		const callbackUrl = `${protocol}://${host}/api/installer/callback?taskId=${taskId}`;
		const uploadUrl = await generatePutPresignedUrl(taskId, 900);
		if (uploadUrl) {
			console.log('[Installer] S3 PutPresignUrl:', uploadUrl);
			console.log('[Installer] CallbackUrl:', callbackUrl);
		}
		if (process.env.NODE_ENV === 'development') {
			console.log('[Installer] Config:', JSON.stringify(config, null, 2));
		}

		if (builderWebhook) {
			const formData = new FormData();

			const webhookAuthId = process.env.WINSTALL_BUILDER_WEBHOOK_AUTH_ID;
			const webhookAuthSecret = process.env.WINSTALL_BUILDER_WEBHOOK_AUTH_SECRET;
			const webhookSleepTime = process.env.WINSTALL_BUILDER_SLEEP_TIME || "0";
			const webhookProjectName = process.env.WINSTALL_BUILDER_PROJECT_NAME || "Winstall_Installer_Builder";
			const webhookVersion = process.env.WINSTALL_BUILDER_VERSION || "v0.9.1.0";
			const webhookRcUpdateId = process.env.WINSTALL_BUILDER_RC_UPDATE_ID || "129";

			if (webhookAuthId) formData.append('user_id', webhookAuthId);
			if (webhookAuthSecret) formData.append('token', webhookAuthSecret);
			if (webhookSleepTime) formData.append('sleep_time', webhookSleepTime);
			if (webhookProjectName) formData.append('project_name', webhookProjectName);
			if (webhookVersion) formData.append('version', webhookVersion);
			if (webhookRcUpdateId) formData.append('rc_update_id', webhookRcUpdateId);

			formData.set('Content-Type', 'application/json');
			formData.append('filename', filename || `winstall-${taskId}.exe`);

			if (uploadUrl) {
				formData.append('url_upload', uploadUrl);
			}
			formData.append('url_callback', callbackUrl);
			formData.append('installer_config', JSON.stringify(config));

			const webhookHeaders = {};
			if (webhookAuthId && webhookAuthSecret) {
				webhookHeaders.Authorization = `Basic ${Buffer.from(`${webhookAuthId}:${webhookAuthSecret}`).toString('base64')}`;
			}

			if (process.env.NODE_ENV === 'development') {
				console.log('[Installer] WebhookUrl:', builderWebhook);
			}
			const webhookResponse = await fetch(builderWebhook, {
				method: 'POST',
				headers: webhookHeaders,
				body: formData,
			});

			if (!webhookResponse.ok) {
				const responseText = await webhookResponse.text();
				throw new Error(
					`Webhook request failed (${webhookResponse.status}): ${responseText.slice(0, 500)}`,
				);
			}
		} else {
			const payload = {
				config,
			};

			if (uploadUrl) {
				payload.upload = {
					upload_url: uploadUrl,
					callback_url: callbackUrl,
				};
			}

			const url = `${builderBase}/installer`;
			if (process.env.NODE_ENV === 'development') {
				console.log('[Installer] BuilderUrl:', url);
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
		}

		const statusUrlObj = new URL(`${protocol}://${host}/api/installer/status`);
		statusUrlObj.searchParams.set('taskId', taskId);
		if (filename) statusUrlObj.searchParams.set('fileName', filename);
		const statusUrl = statusUrlObj.toString();
		console.log('[Installer] StatusUrl:', statusUrl);

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
