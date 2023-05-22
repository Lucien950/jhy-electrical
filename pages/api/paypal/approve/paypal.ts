import { NextApiRequest, NextApiResponse } from "next"
import { apiRespond } from "util/api";
import { DOMAIN, PAYPALDOMAIN } from "util/domain";
import { generateAccessToken } from "util/paypal/server/auth";
import {OrderResponseBody} from "@paypal/paypal-js"
import { PayPalError } from "types/paypal";

export type approvePayPalProps = { token: string }
export type approvePayPalRes = { redirect_link: string }
export default async function (req: NextApiRequest, res: NextApiResponse) {
	const { token } = req.body as approvePayPalProps
	if (!token) return apiRespond(res, "error", "No token provided")
	if (typeof token != "string") return apiRespond(res, "error", "OrderID not a string")

	const returnDomain = DOMAIN
	const response = await fetch(`${PAYPALDOMAIN}/v2/checkout/orders/${token}/confirm-payment-source`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${await generateAccessToken()}`
		},
		body: JSON.stringify({
			payment_source: {
				paypal: {
					experience_context: {
						landing_page: "LOGIN",
						user_action: "PAY_NOW",
						payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
						payment_method_selected: "PAYPAL",
						brand_name: "JHY Electrical",
						return_url: `${returnDomain}/checkout`,
						cancel_url: `${returnDomain}/checkout`,
					}
				}
			}
		})
	})

	if (!response.ok) { return apiRespond(res, "error", await response.json() as PayPalError) }
	const redirectObj = (await response.json() as OrderResponseBody).links.find(l => l.rel === "payer-action")
	if (!redirectObj) return apiRespond(res, "error", "No redirect link found")
	return apiRespond(res, "response", { redirect_link: redirectObj.href } as approvePayPalRes)
}