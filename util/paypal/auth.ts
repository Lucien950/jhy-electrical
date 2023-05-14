import { PayPalAuth } from "types/paypalTypes"
import { baseURL } from "util/paypal/baseURL";

const generateAccessToken = async (): Promise<string | void> => {
	const clientid = process.env.NODE_ENV === "development"
										? process.env.NEXT_PUBLIC_PAYPAL_CLIENTID_DEV
										: process.env.NEXT_PUBLIC_PAYPAL_CLIENTID
	const secret = process.env.NODE_ENV === "development"
										? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET_DEV
										: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET
	
	const auth = Buffer.from(clientid + ":" + secret).toString("base64");
	const response = await fetch(`${baseURL}/v1/oauth2/token`, {
		method: "post",
		body: "grant_type=client_credentials",
		headers: {
			Authorization: `Basic ${auth}`,
		},
	});
	const data: PayPalAuth = await response.json();
	return data.access_token;
}

export { generateAccessToken }