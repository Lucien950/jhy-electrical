import { connectFirestoreEmulator } from "firebase/firestore";
import { connectStorageEmulator } from "firebase/storage";
import { db } from "./firestore";
import { storage } from "./storage";
import { firebaseConsoleBadge } from "./console";

const EMULATORS_STARTED = 'EMULATORS_STARTED';
function startEmulators() {
	if (!(process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_FIREBASE_EMULATE) || (global as any)[EMULATORS_STARTED] ) {return}

	console.log(...firebaseConsoleBadge, "Starting Emulator");
	(global as any)[EMULATORS_STARTED] = true;
	connectFirestoreEmulator(db, 'localhost', 8080);
	connectStorageEmulator(storage, 'localhost', 9199);
}
startEmulators()