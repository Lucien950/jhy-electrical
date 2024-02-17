// paypal
import { PAYPALDOMAIN } from "../../paypalDomain";
import { generateAccessToken } from "server/paypal";
import {components} from "@paypal/paypal-js/types/apis/openapi/checkout_orders_v2"


type paypal_authorize_success = components["schemas"]["order_authorize_response"]

export const submitPayPalOrder = async (token: string): Promise<paypal_authorize_success> => {
	// authorize payment
	const options = { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await generateAccessToken()}` }, };
	const authResponse = await fetch(`${PAYPALDOMAIN}/v2/checkout/orders/${token}/authorize`, options)
	const data = await authResponse.json()
	if (!authResponse.ok) throw data
	return data
}