import { PayPalClientToken } from "types/paypal"
import { apiResponse } from "util/api"

export const getClientID = async () => {
	const response = await fetch("/api/paypal/clienttoken")
	const { res, err } = await response.json() as apiResponse<PayPalClientToken, any>
	if (response.ok) return res!.client_token
	else{
		console.error(err)
		throw new Error("Client ID Server Side Error: Check Console for more details")
	}
}