// SERVERSIDE
import type { NextApiRequest, NextApiResponse } from 'next'
import { apiHandler, apiRespond } from 'util/paypal/server/api';
// types
import { OrderProduct, orderProductSchema } from 'types/order';
import { makePrice } from 'util/priceUtil';
import { OrderResponseBodyMinimal } from "@paypal/paypal-js"
import { PriceInterface } from "types/price";
import { fillOrderProducts } from 'util/orderUtil';
import { createOrderAPICall } from 'util/paypal/server/createOrderFetch';
import Joi from 'joi';
import { validateSchema } from 'util/typeValidate';

export type createOrderProps = { products: OrderProduct[], express?: boolean, }
const createOrderPropsSchema = Joi.object({
	products: Joi.array().items(orderProductSchema).required().min(1),
	express: Joi.boolean().optional()
})
export type createOrderRes = {
	orderStatus: OrderResponseBodyMinimal["status"], orderID: string,
	redirect_link: string | null,
	paymentInformation: PriceInterface
}
/**
 * Create Order API Endpoint
 */
async function createOrderAPI (req: NextApiRequest, res: NextApiResponse){
	// INPUTS
	const { products: emptyProducts, express = false } = validateSchema<createOrderProps>(req.body, createOrderPropsSchema)
	// if (!vCreateOrderProps(req.body)) return apiRespond(res, "error", vCreateOrderPropsErr(req.body))
	// fill products
	const products = await fillOrderProducts(emptyProducts) //this validates that all products are valid
	if (!products.every(p => p.quantity <= p.product.quantity)) return apiRespond(res, "error", "Not enough stock for one of the products")
	const paymentInformation = await makePrice(products)
	const order = await createOrderAPICall(paymentInformation, products, express)

	return apiRespond<createOrderRes>(res, "response", {
		orderStatus: order.status,
		orderID: order.id,
		// this must be present
		redirect_link: order.links.find(l => l.rel == "approve")?.href || null,
		paymentInformation
	})
}

export default apiHandler({
	"POST": createOrderAPI
})