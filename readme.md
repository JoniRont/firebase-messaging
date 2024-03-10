- Create service account (https://console.firebase.google.com/u/0/project/_/settings/serviceaccounts/adminsdk)
- For local development create file <.dev.vars> with variables
		ENVIRONMENT=development
		TYPE= service_account
		PROJECT_ID= project_id
		PRIVATE_KEY_ID= private_id
		PRIVATE_KEY= -----BEGIN PRIVATE KEY-----\n' +
		'xxxxx\n' +
		'xxxxx\n' +....
		'-----END PRIVATE KEY-----\n'
		CLIENT_EMAIL= firebase-xxx.com
		CLIENT_ID= <number>
		AUTH_URI= uri
		TOKEN_URI= oauth2 uri
		AUTH_PROVIDER_X509_CERT_URL= oauth cert uri
		CLIENT_X509_CERT_URL= uri
		UNIVERSE_DOMAIN= uri
