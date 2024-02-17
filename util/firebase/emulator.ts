import { connectFirestoreEmulator } from "firebase/firestore";
import { connectStorageEmulator } from "firebase/storage";
import { db } from "./firestore";
import { storage } from "./storage";
import { firebaseConsoleBadge } from "./console";
import { DEVENV } from "types/env";

const EMULATORS_STARTED = 'EMULATORS_STARTED';
function startEmulators() {
	const isDev = DEVENV
	const isEmulate = process.env.NEXT_PUBLIC_FIREBASE_EMULATE === "true"
	if (!(isDev && isEmulate) || (global as any)[EMULATORS_STARTED] ) {
		return
	}

	console.log(...firebaseConsoleBadge, "Starting Emulator");
	(global as any)[EMULATORS_STARTED] = true;
	connectFirestoreEmulator(db, 'localhost', 8080);
	connectStorageEmulator(storage, 'localhost', 9199);
}
startEmulators()