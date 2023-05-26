import { NextApiRequest, NextApiResponse } from "next"
import { validateFinalCustomer, validateFinalCustomerError } from "types/customer"
import { validateFinalPrice, validateFinalPriceError } from "types/price"
import { apiHandler, apiRespond } from "util/paypal/server/api"
import { fillOrderProducts } from "util/orderUtil"
import { getOrder } from "util/paypal/server/getOrderFetch"
import { submitOrderFetch } from "util/paypal/server/submitOrderFetch"
import Joi from "joi"
import { validateSchema } from "util/typeValidate"

export type submitOrderProps = { token: string }
export type submitOrderRes = { firebaseOrderID: string }
/**
 * Submitting Order API Endpoint
 */
async function submitOrderAPI (req: NextApiRequest, res: NextApiResponse) {
	// INPUT VALIDATION
	const { token } = validateSchema<submitOrderProps>(req.body, Joi.object({ token: Joi.string().required() }))

	// make sure order is well formed before authorizing the payment
	const { products: emptyProducts, priceInfo, customerInfo, status } = await getOrder(token)

	// validation, slightly optional, but just more hurdles
	// validates p1 completion
	if (!validateFinalCustomer(customerInfo)) { console.error("customer error"); throw validateFinalCustomerError(customerInfo) }
	// this validates that p0 has been completed
	if (!validateFinalPrice(priceInfo)) { console.error("price error"); throw validateFinalPriceError(priceInfo) }
	if (status !== "APPROVED") throw "Error is not Approved"

	// populate cart (fossilize the cart in case products change/are removed)
	const cart = await fillOrderProducts(emptyProducts)
	
	const {firebaseOrderID} = await submitOrderFetch(token, cart, customerInfo, priceInfo)
	return apiRespond<submitOrderRes>(res, "response", { firebaseOrderID })
}

export default apiHandler({
	"POST": submitOrderAPI
})