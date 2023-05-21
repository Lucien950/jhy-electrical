import { app } from "./index"
import { getAnalytics, isSupported } from "firebase/analytics";

export const analytics = () => getAnalytics(app);
