// SERVERSIDE
import type { NextApiRequest, NextApiResponse } from 'next'
import { OrderProduct } from 'types/order';
import { PayPalCreateOrder } from 'types/paypalTypes';
import { generateAccessToken } from 'util/paypal/auth';
import { baseURL } from 'util/paypal/baseURL';
import { PriceInterface, makePrice as findPrice } from 'util/priceUtil';
import { getProductByID } from 'util/productUtil';

const createOrder = async (access_token: string, paymentInformation: PriceInterface) => {
	const returnDomain = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://jhycanada.ca"
	const orderInformation = {
		intent: "AUTHORIZE",
		purchase_units: [{
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
			cancel_url: `${returnDomain}/cart`,
			brand_name: "JHY Electrical"
		},
	}
	const response = await fetch(`${baseURL}/v2/checkout/orders`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${access_token}`,
		},
		body: JSON.stringify(orderInformation)
	})
	if(response.ok) return await response.json() as PayPalCreateOrder
	else throw await response.json()
}

export type createOrderAPIReturn = { orderStatus: string, orderID: string, redirect_link: string, update_link: string, submit_link: string, paymentInformation: PriceInterface}
export default async (req: NextApiRequest, res: NextApiResponse) =>{
	// INPUTS
	const { products: productIDS, postal_code }: { products: OrderProduct[], postal_code?: string } = req.body
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
	const paymentInformation = await findPrice(products, postal_code)

	const order = await createOrder(accessToken, paymentInformation).catch(e=>res.status(500).send(e))

	if(!order) return
	res.status(200).send({
		orderID: order.id,
		orderStatus: order.status,
		redirect_link: order.links.find(l => l.rel =="approve")!.href,
		update_link: order.links.find(l => l.rel == "update")!.href,
		submit_link: order.links.find(l => l.rel == "capture")!.href,
		paymentInformation
	} as createOrderAPIReturn)
}