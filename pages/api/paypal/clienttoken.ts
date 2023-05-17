import type { NextApiRequest, NextApiResponse } from 'next'
import { PayPalClientToken, PayPalSimpleError } from 'types/paypal';
import { apiRespond } from 'util/api';
import { generateAccessToken } from 'util/paypal/auth';
import { baseURL } from 'util/paypal/baseURL';

/**
 * This function is for client tokens (for paypal javascript SDK) 
 */
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
		const data = await response.json() as PayPalClientToken
		apiRespond(res, "response", data)
	}
	else{
		// TODO
		const data = await response.json() as PayPalSimpleError
		throw new Error(`${data.error}: ${data.error_description}`)
	}
}