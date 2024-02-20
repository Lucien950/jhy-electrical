// types
import { OrderProduct, orderProductSchema } from 'types/order';
import { makePrice } from 'server/priceUtil';
import { OrderResponseBody } from "@paypal/paypal-js"
import { fillOrderProducts } from 'util/order';
import { createOrderAPICall } from 'app/api/paypal/order/createOrderFetch';
import Joi from 'joi';
import { validateSchema } from 'util/typeValidate';
import { apiHandler } from 'server/api';

export type createOrderProps = { products: OrderProduct[], express?: boolean, }
const createOrderPropsSchema = Joi.object({
	products: Joi.array().items(orderProductSchema).required().min(1),
	express: Joi.boolean().optional()
})
export type createOrderRes = {
	orderStatus: OrderResponseBody["status"],
	orderID: string,
	redirect_link: string | null,
}
/**
 * Create Order API Endpoint
 */
async function createOrderHandler(req: Request): Promise<createOrderRes> {
	// INPUTS
	const { products: orderProducts, express = false } = validateSchema<createOrderProps>(req.body, createOrderPropsSchema)
	// fill products
	const products = await fillOrderProducts(orderProducts) //this validates that all products are valid
	if (!products.every(orderProduct => orderProduct.quantity <= orderProduct.product.quantity))
		throw new Error("Not enough stock for one of the products")
	const paymentInformation = await makePrice(products)
	const order = await createOrderAPICall(paymentInformation, products, express)

	return {
		orderStatus: order.status,
		orderID: order.id!,
		// this must be present
		redirect_link: order.links?.find(l => l.rel == "approve")?.href || null,
	}
}

export const POST = (req: Request): Response => apiHandler(req, createOrderHandler)