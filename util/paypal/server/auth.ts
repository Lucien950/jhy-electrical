import { PayPalAuth, PayPalSimpleError } from "types/paypal"
import { PAYPALDOMAIN } from "util/domain";
import { toB64 } from "util/index";

const generateAccessToken = async () => {
	const clientid = process.env.NODE_ENV === "development"
										? process.env.NEXT_PUBLIC_PAYPAL_CLIENTID_DEV
										: process.env.NEXT_PUBLIC_PAYPAL_CLIENTID
	const secret = process.env.NODE_ENV === "development"
										? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET_DEV
										: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET
	
	const auth = toB64(`${clientid}:${secret}`)
	const response = await fetch(`${PAYPALDOMAIN}/v1/oauth2/token`, {
		method: "post",
		body: "grant_type=client_credentials",
		headers: {
			Authorization: `Basic ${auth}`,
		},
	})
	if (response.ok) return (await response.json() as PayPalAuth).access_token
	else throw await response.json() as PayPalSimpleError
}

export { generateAccessToken }