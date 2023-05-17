// SERVERSIDE
import type { NextApiRequest, NextApiResponse } from 'next'
import { apiRespond } from 'util/api';
// util
import { generateAccessToken } from 'util/paypal/auth';
import { baseURL } from 'util/paypal/baseURL';
import { getProductByID } from 'util/productUtil';
// types
import { OrderProduct, validateOrderProduct } from 'types/order';
import { CreateOrderRequestBody, OrderResponseBody } from "@paypal/paypal-js"
import { PriceInterface, makePrice } from 'util/priceUtil';
import { validatePostalCode } from 'util/shipping/postalCode';

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
	else throw new Error(JSON.stringify(data))
}

export type createOrderAPIProps = { products: OrderProduct[], postal_code?: string, cancelPath: string }
export type createOrderAPIRes = { orderStatus: string, orderID: string, redirect_link: string | null, update_link: string | null, submit_link: string | null, paymentInformation: PriceInterface}
export default async (req: NextApiRequest, res: NextApiResponse) =>{
	// INPUTS
	const { products: productIDS, postal_code, cancelPath ="/" }: createOrderAPIProps = req.body
	if (!productIDS) return apiRespond(res, "error", "Products not provided")
	if (!productIDS.every(p => validateOrderProduct(p))) return apiRespond(res, "error", "Products are not well formed")
	if(!postal_code) return apiRespond(res, "response", "Postal Code not Provided")
	if(!validatePostalCode(postal_code)) return apiRespond(res, "error", "Postal Code not Valid")

	// access token
	const accessToken = await generateAccessToken().catch(apiRespond(res, "error"))
	if (!accessToken) return

	const products = await Promise.all(productIDS.map(async p => ({ ...p, product: await getProductByID(p.PID) })))
	const paymentInformation = await makePrice(products, postal_code)
	
	const order = await createOrderAPICall(accessToken, cancelPath, paymentInformation, productIDS).catch(apiRespond(res, "error"))
	if(!order) return

	apiRespond<createOrderAPIRes>(res, "response", {
		orderStatus: order.status,
		orderID: order.id,
		redirect_link: order.links.find(l => l.rel == "approve")?.href || null,
		update_link: order.links.find(l => l.rel == "update")?.href || null,
		submit_link: order.links.find(l => l.rel == "capture")?.href || null,
		paymentInformation
	})
}