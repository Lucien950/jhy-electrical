// SERVERSIDE
import type { NextApiRequest, NextApiResponse } from 'next'
import { apiRespond } from 'util/paypal/server/api';
// types
import { OrderProduct, validateOrderProduct } from 'types/order';
import { makePrice } from 'util/priceUtil';
import { OrderResponseBodyMinimal } from "@paypal/paypal-js"
import { PriceInterface } from "types/price";
import { validatePostalCode } from 'util/shipping/postalCode';
import { fillOrderProducts } from 'util/orderUtil';
import { createOrderAPICall } from 'util/paypal/server/createOrderFetch';

export type createOrderAPIProps = { products: OrderProduct[], postal_code?: string, express?: boolean, }
export type createOrderAPIRes = {
	orderStatus: OrderResponseBodyMinimal["status"], orderID: string,
	redirect_link: string | null,
	paymentInformation: PriceInterface
}

/**
 * Create Order API Endpoint
 */
export default async function (req: NextApiRequest, res: NextApiResponse){
	// INPUTS
	const { products: emptyProducts, postal_code, express = false}: createOrderAPIProps = req.body
	if (!emptyProducts) return apiRespond(res, "error", "Product IDs not complete")
	if (emptyProducts.length == 0) return apiRespond(res, "error", "No products in cart")
	if (!emptyProducts.every(p => validateOrderProduct(p))) return apiRespond(res, "error", "Products are not well formed")
	if (postal_code && !validatePostalCode(postal_code)) return apiRespond(res, "error", "Postal Code is not valid")
	if (express && typeof express != "boolean") return apiRespond(res, "error", "Express is not a boolean")

	try{
		// fill products
		const products = await fillOrderProducts(emptyProducts) //this validates that all products are valid
		const paymentInformation = await makePrice(products, postal_code)
		const order = await createOrderAPICall(paymentInformation, emptyProducts, express)
	
		return apiRespond<createOrderAPIRes>(res, "response", {
			orderStatus: order.status,
			orderID: order.id,
			// this must be present
			redirect_link: order.links.find(l => l.rel == "approve")?.href || null,
			paymentInformation
		})
	}
	catch(e){ return apiRespond(res, "error", e) }
}