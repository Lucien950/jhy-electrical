import { PayPalAuth, PayPalSimpleError } from "types/paypal"
import { PAYPALDOMAIN } from "server/paypal/domain";
import { toB64 } from "util/string";

const generateAccessToken = async () => {
	const clientid = process.env.NODE_ENV === "development"
										? process.env.PAYPAL_CLIENTID_DEV
										: process.env.PAYPAL_CLIENTID
	const secret = process.env.NODE_ENV === "development"
										? process.env.PAYPAL_CLIENT_SECRET_DEV
										: process.env.PAYPAL_CLIENT_SECRET
	if(clientid === undefined || secret === undefined) throw new Error("PayPal clientid or secret not found")
	const auth = toB64(`${clientid}:${secret}`)
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${auth}`
		},
		body: new URLSearchParams({ grant_type: 'client_credentials' })
	};
	
	const response = await fetch(`${PAYPALDOMAIN}/v1/oauth2/token`, options)
	if (response.ok) return (await response.json() as PayPalAuth).access_token
	else throw await response.json() as PayPalSimpleError
}

export { generateAccessToken }