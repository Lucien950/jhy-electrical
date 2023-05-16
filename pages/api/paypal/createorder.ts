// SERVERSIDE
import type { NextApiRequest, NextApiResponse } from 'next'
import { OrderProduct } from 'types/order';
import { generateAccessToken } from 'util/paypal/auth';
import { baseURL } from 'util/paypal/baseURL';
import { PriceInterface, makePrice } from 'util/priceUtil';
import { getProductByID } from 'util/productUtil';
import { CreateOrderRequestBody, OrderResponseBody } from "@paypal/paypal-js"

const createOrderAPICall = async (access_token: string, cancel_url: string, paymentInformation: PriceInterface, productIDS: OrderProduct[]) => {
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
			cancel_url: `${returnDomain}/${cancel_url}`,
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

export type createOrderAPIProps = { products: OrderProduct[], postal_code?: string, cancel_url: string }
export type createOrderAPIReturn = { orderStatus: string, orderID: string, redirect_link: string, update_link: string, submit_link: string, paymentInformation: PriceInterface}
export default async (req: NextApiRequest, res: NextApiResponse) =>{
	// INPUTS
	const { products: productIDS, postal_code, cancel_url }: createOrderAPIProps = req.body
	if (!productIDS || !(productIDS.every(p=>p && p.PID && p.quantity))){
		res.status(500).send({ error_message: "Products not provided or incorrectly formatted" })
	}

	// access token
	const accessToken = await generateAccessToken()
	if(!accessToken){
		res.status(500).send({ error_message: "Access Token could not be generated"})
		return
	}

	const products = await Promise.all(productIDS.map(async p => ({ ...p, product: await getProductByID(p.PID) })))
	const paymentInformation = await makePrice(products, postal_code)
	
	const order = await createOrderAPICall(accessToken, cancel_url, paymentInformation, productIDS).catch(e=>res.status(500).send(e.message))
	if(!order) return

	res.status(200).send({
		orderID: order.id,
		orderStatus: order.status,
		redirect_link: order.links.find(l => l.rel =="approve")?.href,
		update_link: order.links.find(l => l.rel == "update")?.href,
		submit_link: order.links.find(l => l.rel == "capture")?.href,
		paymentInformation
	} as createOrderAPIReturn)
}