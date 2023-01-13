import { NextApiRequest, NextApiResponse } from "next";
import { generateAccessToken } from "util/paypal/auth";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { amount, token }: { amount?: number, token?: string } = req.body

	if(!amount){
		res.status(500).send({
			error_message: "Amount not provided in body"
		})
		return
	}

	if(!token){
		res.status(500).send({
			error_message: "Token not provided in query path"
		})
		return
	}
	
	const body = [
		{
			"op": "replace",
			"path": "/purchase_units/@reference_id=='default'/amount",
			"value": {
				"currency_code": "CAD",
				"value": amount.toFixed(2)
			}
		}
	]
	const options = {	
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await generateAccessToken()}`
		},
		body: JSON.stringify(body)
	};


	await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}`, options).catch(err=>{
		res.status(500).send(err)
	})
	res.status(200).end()
}