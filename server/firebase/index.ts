import admin, { ServiceAccount } from 'firebase-admin';

const serviceAccount = {
	"type": "service_account",
	"project_id": "jhy-electrical",
	"auth_uri": "https://accounts.google.com/o/oauth2/auth",
	"token_uri": "https://oauth2.googleapis.com/token",
	"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
	"universe_domain": "googleapis.com",

	"private_key_id": process.env.FIREBASE_SERVER_private_key_id,
	"private_key": process.env.FIREBASE_SERVER_private_key,
	"client_email": process.env.FIREBASE_SERVER_client_email,
	"client_id": process.env.FIREBASE_SERVER_client_id,
	"client_x509_cert_url": process.env.FIREBASE_SERVER_client_x509_cert_url,
}


if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount as ServiceAccount),
		projectId: "jhy-electrical",
		storageBucket: "jhy-electrical.appspot.com",
	})
}

export default admin;