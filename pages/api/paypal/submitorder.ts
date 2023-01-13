import { NextApiRequest, NextApiResponse } from "next";
import { generateAccessToken } from "util/paypal/auth";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { token } : { token?: string } = JSON.parse(req.body)
	if(!token){
		res.status(500).send({error_message: "Token is required to submit order"})
		return
	}

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await generateAccessToken()}`
		},
	};

	const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/authorize`, options)
		.catch(err => {
			res.status(500).send(err)
		});
	if(!response) return
	const data = await response.json()
	res.status(200).send(data)
}