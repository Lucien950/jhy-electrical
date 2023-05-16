import type { NextApiRequest, NextApiResponse } from 'next'
import { generateAccessToken } from 'util/paypal/auth';
import { baseURL } from 'util/paypal/baseURL';

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const accessToken = await generateAccessToken();
	const response = await fetch(`${baseURL}/v1/identity/generate-token`, {
		method: "post",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Accept-Language": "en_US",
			"Content-Type": "application/json",
		},
	});
	if(response.ok){
		const data = await response.json();
		res.status(200).send(data)
	}
	else{
		// TODO
	}
}