import { DEVENV, ENV } from "util/env"

export const DOMAIN = ENV === "node_dev"
	? "http://localhost:3000"
	: process.env.VERCEL === "1"
			? "https://jhy-electrical-pre.vercel.app"
			: "https://jhycanada.ca"

export const PAYPALDOMAIN = DEVENV
	? "https://api-m.sandbox.paypal.com"
	: "https://api-m.paypal.com"