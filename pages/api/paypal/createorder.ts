// SERVERSIDE
import type { NextApiRequest, NextApiResponse } from 'next'
import { apiRespond } from 'util/api';
// util
import { generateAccessToken } from 'util/paypal/server/auth';
import { baseURL } from 'util/paypal/baseURL';
// types
import { OrderProduct, validateOrderProduct } from 'types/order';
import { CreateOrderRequestBody, OrderResponseBody, OrderResponseBodyMinimal } from "@paypal/paypal-js"
import { makePrice } from 'util/priceUtil';
import { PriceInterface } from "types/price";
import { validatePostalCode } from 'util/shipping/postalCode';
import { fillOrderProducts } from 'util/orderUtil';
import { PayPalError } from 'types/paypal';

const createOrderAPICall = async (access_token: string, cancelPath: string, paymentInformation: PriceInterface, productIDS: OrderProduct[]) => {
	const returnDomain = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://jhycanada.ca"
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
			cancel_url: `${returnDomain}/${cancelPath}`,
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

export type createOrderAPIProps = { products: OrderProduct[], postal_code?: string, cancelPath: string }
export type createOrderAPIRes = {
	orderStatus: OrderResponseBodyMinimal["status"], orderID: string,
	redirect_link: string | null,
	paymentInformation: PriceInterface
}

/**
 * Create Order API Endpoint
 */
export default async (req: NextApiRequest, res: NextApiResponse) =>{
	// INPUTS
	const { products: productIDs, postal_code, cancelPath = "/" }: createOrderAPIProps = req.body
	if (!productIDs){
		if (process.env.NODE_ENV === "development") return apiRespond(res, "error", "Product IDs not complete")
		return apiRespond(res, "error", "Body not complete")
	}
	if (!productIDs.every(p => validateOrderProduct(p))) return apiRespond(res, "error", "Products are not well formed")
	if (postal_code && !validatePostalCode(postal_code)) return apiRespond(res, "error", "Postal Code is not valid")

	try{
		// access token
		const accessToken = await generateAccessToken()
		// fill products
		const products = await fillOrderProducts(productIDs)
		const paymentInformation = await makePrice(products, postal_code)
		const order = await createOrderAPICall(accessToken, cancelPath, paymentInformation, productIDs)
	
		apiRespond<createOrderAPIRes>(res, "response", {
			orderStatus: order.status,
			orderID: order.id,
			// this must be present
			redirect_link: order.links.find(l => l.rel == "approve")?.href || null,
			paymentInformation
		})
	}
	catch(e){
		apiRespond(res, "error", e)
	}
}