import { apiResponse } from "server/api"
import { submitOrderProps, submitOrderRes } from "app/api/paypal/order/submit"

export const submitOrder = async (orderID: string) => {
	const response = await fetch("/api/paypal/submitorder", {
		method: "POST",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token: orderID } as submitOrderProps)
	})
	const { res, err } = await response.json() as apiResponse<submitOrderRes, unknown>
	if (response.ok) return res!
	else throw err
}