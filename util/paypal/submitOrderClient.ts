import { submitOrderRes } from "pages/api/paypal/submitorder"
import { submitOrderProps } from "pages/api/paypal/submitorder"
import { apiResponse } from "util/api"

export const submitOrder = async (orderID: string) => {
	const response = await fetch("/api/paypal/submitorder", {
		method: "POST",
		body: JSON.stringify({ token: orderID } as submitOrderProps)
	})
	const { res, err } = await response.json() as apiResponse<submitOrderRes, any>
	if (response.ok) return res!
	else{
		console.error(`Submit Order Error: ${err}`)
		throw new Error(err)
	}
}