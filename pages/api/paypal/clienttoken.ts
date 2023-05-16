import type { NextApiRequest, NextApiResponse } from 'next'
import { apiRespond } from 'util/api';
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
		const data = await response.json(); //TODO type this
		apiRespond(res, "response", data)
	}
	else{
		// TODO
	}
}