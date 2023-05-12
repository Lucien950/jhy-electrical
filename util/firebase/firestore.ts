import { getFirestore } from "firebase/firestore";
import { app } from "./index"

export const db = getFirestore(app)