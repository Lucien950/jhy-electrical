export const ENV =
process.env.NODE_ENV === "development"
	? "node_dev"
	: process.env.VERCEL !== "1"
		? "node_prod"
		: `vercel_${process.env.VERCEL_ENV}`


export const DEVENV = ["node_dev", "vercel_development", "vercel_preview"].includes(ENV)