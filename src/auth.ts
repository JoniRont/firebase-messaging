/**
 * Normalizes Google Cloud Platform (GCP) service account credentials.
 */
export function getCredentials(credentials: Credentials | string): Credentials {
	return typeof credentials === 'string' || credentials instanceof String
		? Object.freeze(JSON.parse(credentials as string))
		: Object.isFrozen(credentials)
		? credentials
		: Object.freeze(credentials);
}

/**
 * Imports a private key from the provided Google Cloud (GCP)
 * service account credentials.
 */
export function getPrivateKey(options: { credentials: Credentials | string }) {
	const credentials = getCredentials(options.credentials);
}

/**
 * Service account credentials for Google Cloud Platform (GCP).
 *
 * @see https://cloud.google.com/iam/docs/creating-managing-service-account-keys
 */
export type Credentials = {
	type: string;
	project_id: string;
	private_key_id: string;
	private_key: string;
	client_id: string;
	client_email: string;
	auth_uri: string;
	token_uri: string;
	auth_provider_x509_cert_url: string;
	client_x509_cert_url: string;
};
