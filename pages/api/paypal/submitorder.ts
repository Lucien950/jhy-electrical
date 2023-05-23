import { NextApiRequest, NextApiResponse } from "next"
import { validateCustomer, validateCustomerError } from "types/customer"
import { validateFinalPrice, validateFinalPriceError } from "types/price"
import { apiRespond } from "util/api"
import { fillOrderProducts } from "util/orderUtil"
import { getOrder } from "util/paypal/server/getOrderFetch"
import { submitOrderFetch } from "util/paypal/server/submitOrderFetch"

export type submitOrderProps = { token: string }
export type submitOrderRes = { firebaseOrderID: string }

/**
 * Submitting Order API Endpoint
 */
export default async function (req: NextApiRequest, res: NextApiResponse) {
	// INPUT VALIDATION
	const { token }: submitOrderProps = req.body
	if (!token) return apiRespond(res, "error", "Token is required to submit order")
	if (typeof token != "string") return apiRespond(res, "error", "Token is not a string")

	try {
		// make sure order is well formed before authorizing the payment
		const { products: emptyProducts, priceInfo, customerInfo, status } = await getOrder(token)

		// validation, slightly optional, but just more hurdles
		// validates p1 completion
		if (!validateCustomer(customerInfo)) { console.error("customer error"); throw validateCustomerError(customerInfo) }
		// this validates that p0 has been completed
		if (!validateFinalPrice(priceInfo)) { console.error("price error"); throw validateFinalPriceError(priceInfo) }
		if (status !== "APPROVED") throw "Error is not Approved"

		// populate cart (fossilize the cart in case products change/are removed)
		const cart = await fillOrderProducts(emptyProducts)
		
		const {firebaseOrderID} = await submitOrderFetch(token, cart, customerInfo, priceInfo)
		return apiRespond<submitOrderRes>(res, "response", { firebaseOrderID })
	}
	catch (e) { return apiRespond(res, "error", e) }
}