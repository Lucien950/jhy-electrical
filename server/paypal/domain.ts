export const DOMAIN =process.env.NODE_ENV === "development"
	? "http://localhost:3000"
	: process.env.VERCEL === "1"
			? "https://jhy-electrical-pre.vercel.app"
			: "https://jhycanada.ca"

export const PAYPALDOMAIN = process.env.NODE_ENV === "development"
	? "https://api-m.sandbox.paypal.com"
	: "https://api-m.paypal.com"