// SERVERSIDE
import type { NextApiRequest, NextApiResponse } from 'next'
import { apiRespond } from 'util/api';
// util
import { generateAccessToken } from 'util/paypal/server/auth';
import { baseURL } from 'util/paypal/baseURL';
import { DOMAIN } from "util/domain"
// types
import { OrderProduct, validateOrderProduct } from 'types/order';
import { CreateOrderRequestBody, OrderResponseBody, OrderResponseBodyMinimal } from "@paypal/paypal-js"
import { makePrice } from 'util/priceUtil';
import { PriceInterface } from "types/price";
import { validatePostalCode } from 'util/shipping/postalCode';
import { fillOrderProducts } from 'util/orderUtil';
import { PayPalError } from 'types/paypal';

const createOrderAPICall = async (access_token: string, paymentInformation: PriceInterface, productIDS: OrderProduct[], express: boolean) => {
	const returnDomain = DOMAIN
	const orderInformation = {
		intent: "AUTHORIZE",
		purchase_units: [{
			items: productIDS.map(p=>({
				name: p.PID,
				quantity: p.quantity.toString(),
				unit_amount: {
					currency_code: "CAD",
					value: "0"
				}
			})),
			amount: {
				currency_code: "CAD",
				value: paymentInformation.total.toFixed(2),
				breakdown: {
					item_total:{
						currency_code: "CAD",
						value: paymentInformation.subtotal.toFixed(2)
					},
					shipping: {
						currency_code: "CAD",
						value: (paymentInformation.shipping || 0).toFixed(2)
					},
					tax_total: {
						currency_code: "CAD",
						value: paymentInformation.tax.toFixed(2)
					},
				}
			}}],
		application_context:{
			return_url: `${returnDomain}/checkout`,
			cancel_url: `${returnDomain}/${express ? "cart" : "checkout"}`,
			brand_name: "JHY Electrical"
		},
	} as CreateOrderRequestBody

	const response = await fetch(`${baseURL}/v2/checkout/orders`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${access_token}`,
		},
		body: JSON.stringify(orderInformation)
	})
	const data = await response.json()
	if (response.ok) return data as OrderResponseBody
	else throw data as PayPalError
}

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
	const { products: productIDs, postal_code, express = false}: createOrderAPIProps = req.body
	if (!productIDs) return apiRespond(res, "error", "Product IDs not complete")
	if (productIDs.length == 0) return apiRespond(res, "error", "No products in cart")
	if (!productIDs.every(p => validateOrderProduct(p))) return apiRespond(res, "error", "Products are not well formed")
	if (postal_code && !validatePostalCode(postal_code)) return apiRespond(res, "error", "Postal Code is not valid")
	if (express && typeof express != "boolean") return apiRespond(res, "error", "Express is not a boolean")

	try{
		// access token
		const accessToken = await generateAccessToken()
		// fill products
		const products = await fillOrderProducts(productIDs)
		const paymentInformation = await makePrice(products, postal_code)
		const order = await createOrderAPICall(accessToken, paymentInformation, productIDs, express)
	
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