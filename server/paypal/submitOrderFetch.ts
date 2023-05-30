// paypal
import { PAYPALDOMAIN } from "server/paypal/domain";
import { generateAccessToken } from "./auth";

export const submitOrderFetch = async (token: string) => {
	// authorize payment
	const options = { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await generateAccessToken()}` }, };
	const authResponse = await fetch(`${PAYPALDOMAIN}/v2/checkout/orders/${token}/authorize`, options)
	const data = await authResponse.json()
	if (!authResponse.ok) throw data
	return data
}