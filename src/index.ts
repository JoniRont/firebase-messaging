import { ExecutionContext } from '@cloudflare/workers-types/experimental';
import { getAccessToken, getIdToken, verifyIdToken } from 'web-auth-library/google';

export interface Env {
	TYPE: string;
	PROJECT_ID: string;
	PRIVATE_KEY_ID: string;
	PRIVATE_KEY: string;
	CLIENT_EMAIL: string;
	CLIENT_ID: string;
	AUTH_URI: string;
	TOKEN_URI: string;
	AUTH_PROVIDER_X509_CERT_URL: string;
	CLIENT_X509_CERT_URL: string;
	UNIVERSE_DOMAIN: string;
	AUTHORIZATION: string;
}

type MessageBody = {
	message: {
		token: string;
		notification: {
			title: string;
			body: string;
		};
	};
};

type RequestBody = {
	tokens: string[];
	message: {
		title: string;
		body: string;
	};
};

export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param request - The request submitted to the Worker from the client

	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */

	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response | null> {
		try {
			if (request.headers.get('Authorization') !== env.AUTHORIZATION) {
				console.log('UNAUTHORIZED', JSON.stringify(request.headers, null, 2));
				return Promise.resolve(Response.json({ statusCode: 401, message: 'UNAUTHORIZED ' }));
			}
			if (!request.body) {
				console.log('Body missing');
				return Promise.resolve(Response.json({ statusCode: 400, message: 'Body missing' }));
			}
			const body = await request.clone().json<RequestBody>();
			console.log('Start sending message with body', body);

			const credentials = {
				type: env.TYPE,
				project_id: env.PROJECT_ID,
				private_key_id: env.PRIVATE_KEY_ID,
				private_key: env.PRIVATE_KEY,
				client_email: env.CLIENT_EMAIL,
				client_id: env.CLIENT_ID,
				auth_uri: env.AUTH_URI,
				token_uri: env.TOKEN_URI,
				auth_provider_x509_cert_url: env.AUTH_PROVIDER_X509_CERT_URL,
				client_x509_cert_url: env.CLIENT_X509_CERT_URL,
				universe_domain: env.UNIVERSE_DOMAIN,
			};
			const fcmUrlScope = 'https://www.googleapis.com/auth/firebase.messaging';
			const messagingUrl = `https://fcm.googleapis.com/v1/projects/${env.PROJECT_ID}/messages:send`;
			console.log(`Send messages to ${messagingUrl}`);
			const accessToken = await getAccessToken({
				credentials: credentials,
				scope: ['https://www.googleapis.com/auth/cloud-platform', fcmUrlScope],
				waitUntil(promise) {
					return Promise.resolve();
				},
			});
			console.log(`Access token fetch ${accessToken.length ? 'successfully' : 'failed'}`);
			const messageResponse = await Promise.all(
				body.tokens.map((token) =>
					fetch(messagingUrl, {
						headers: { Authorization: `Bearer ${accessToken}` },
						body: JSON.stringify({
							message: {
								token: token,
								notification: {
									body: body.message.body,
									title: body.message.title,
								},
							},
						}),
						method: 'POST',
					})
				)
			);
			console.log('Sending messages finished');
			return Promise.resolve(
				Response.json({
					failed: messageResponse.filter((i) => i.status !== 200).length,
					send: messageResponse.filter((i) => i.status === 200).length,
				})
			);
		} catch (err) {
			console.error('Sending messages failed!', err);
			return Promise.resolve(Response.json({ statusCode: 500, message: err }));
		}
	},
};
