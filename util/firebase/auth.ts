import { getAuth } from "firebase/auth";
import { app } from "./index"
export const auth = getAuth(app)