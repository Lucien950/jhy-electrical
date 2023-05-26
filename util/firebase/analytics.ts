import { app } from "./index"
import { getAnalytics } from "firebase/analytics";

export const analytics = () => getAnalytics(app);
