import type { NextApiRequest, NextApiResponse } from 'next'
import { PayPalCreateOrder } from 'types/paypalTypes';
import { generateAccessToken } from 'util/paypal/auth';
import baseURL from 'util/paypal/baseURL';

const createOrder = async (access_token: string, amount: string, returnURL: string)=>{
	const orderInformation = {
		intent: "AUTHORIZE",
		purchase_units: [ { amount: { currency_code: "CAD", value: amount } } ],
		application_context:{
			return_url: `${returnURL}/checkout`,
			cancel_url: `${returnURL}/cart`,
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
	const data: PayPalCreateOrder = await response.json()
	return data		
}

export default async (req: NextApiRequest, res: NextApiResponse) =>{
	// INPUTS
	const { amount } = req.query
	if (!amount || Array.isArray(amount)) {
		res.status(500).send({ error_message: "Amount not provided, or incorrectly formatted" })
		return
	}

	// access token
	const accessToken = await generateAccessToken()
	if(!accessToken){
		res.status(500).send({error_message: "Access Token could not be generated"})
		return
	}

	// return url
	const returnURL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://jhycanada.ca"

	const order = await createOrder(accessToken, amount, returnURL)
	res.status(200).send({
		orderStatus: order.status,
		redirect_link: order.links?.find(l => l.rel =="approve")?.href
	})
}