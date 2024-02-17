import { DEVENV } from "types/env";


export const PAYPALDOMAIN = DEVENV
	? "https://api-m.sandbox.paypal.com"
	: "https://api-m.paypal.com";
