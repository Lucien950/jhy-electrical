import { PayPalAuth, PayPalSimpleError } from "types/paypal"
import { baseURL } from "util/paypal/baseURL";
import { toB64 } from "util/toB64";

const generateAccessToken = async () => {
	const clientid = process.env.NODE_ENV === "development"
										? process.env.NEXT_PUBLIC_PAYPAL_CLIENTID_DEV
										: process.env.NEXT_PUBLIC_PAYPAL_CLIENTID
	const secret = process.env.NODE_ENV === "development"
										? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET_DEV
										: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET
	
	const auth = toB64(`${clientid}:${secret}`)
	const response = await fetch(`${baseURL}/v1/oauth2/token`, {
		method: "post",
		body: "grant_type=client_credentials",
		headers: {
			Authorization: `Basic ${auth}`,
		},
	})

	const data = await response.json()
	if (response.ok) return (data as PayPalAuth).access_token
	else throw data as PayPalSimpleError
}

export { generateAccessToken }