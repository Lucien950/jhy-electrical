import { submitOrderRes } from "pages/api/paypal/submitorder"
import { submitOrderProps } from "pages/api/paypal/submitorder"
import { apiResponse } from "server/api"
import { clientErrorFactory } from "util/paypal/clientErrorFactory"


const submitOrderError = clientErrorFactory("Submit Order Server Side Error: Check Console for more details")
export const submitOrder = async (orderID: string) => {
	const response = await fetch("/api/paypal/submitorder", {
		method: "POST",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token: orderID } as submitOrderProps)
	})
	const { res, err } = await response.json() as apiResponse<submitOrderRes, any>
	if (response.ok) return res!
	else return submitOrderError(err)
}