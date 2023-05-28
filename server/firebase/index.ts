import admin, { ServiceAccount } from 'firebase-admin';
import * as serviceAccount from "./serviceAccountKey.json"

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount as ServiceAccount),
		projectId: "jhy-electrical",
		storageBucket: "jhy-electrical.appspot.com",
	})
}

export default admin;