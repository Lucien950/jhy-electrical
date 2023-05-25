// SERVERSIDE
import type { NextApiRequest, NextApiResponse } from 'next'
import { apiRespond } from 'util/paypal/server/api';
// types
import { OrderProduct, orderProductSchema } from 'types/order';
import { makePrice } from 'util/priceUtil';
import { OrderResponseBodyMinimal } from "@paypal/paypal-js"
import { PriceInterface } from "types/price";
import { fillOrderProducts } from 'util/orderUtil';
import { createOrderAPICall } from 'util/paypal/server/createOrderFetch';
import Joi from 'joi';
import { validateSchemaGenerator } from 'util/typeValidate';

export type createOrderProps = { products: OrderProduct[], postal_code?: string, express?: boolean, }
const createOrderPropsSchema = Joi.object({
	products: Joi.array().items(orderProductSchema).required().min(1),
	postal_code: Joi.string().optional(),
	express: Joi.boolean().optional()
})
export type createOrderRes = {
	orderStatus: OrderResponseBodyMinimal["status"], orderID: string,
	redirect_link: string | null,
	paymentInformation: PriceInterface
}

const [vCreateOrderProps, vCreateOrderPropsErr] = validateSchemaGenerator<createOrderProps>(createOrderPropsSchema)
/**
 * Create Order API Endpoint
 */
export default async function (req: NextApiRequest, res: NextApiResponse){
	// INPUTS
	if (!vCreateOrderProps(req.body)) return apiRespond(res, "error", vCreateOrderPropsErr(req.body))
	const { products: emptyProducts, postal_code, express = false} = req.body
	try{
		// fill products
		const products = await fillOrderProducts(emptyProducts) //this validates that all products are valid
		if(!products.every(p=>p.quantity <= p.product.quantity)) return apiRespond(res, "error", "Not enough stock for one of the products")
		const paymentInformation = await makePrice(products, postal_code)
		const order = await createOrderAPICall(paymentInformation, emptyProducts, express)
	
		return apiRespond<createOrderRes>(res, "response", {
			orderStatus: order.status,
			orderID: order.id,
			// this must be present
			redirect_link: order.links.find(l => l.rel == "approve")?.href || null,
			paymentInformation
		})
	}
	catch(e){ return apiRespond(res, "error", e) }
}