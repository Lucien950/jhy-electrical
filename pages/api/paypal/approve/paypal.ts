import { NextApiRequest, NextApiResponse } from "next"
import { apiRespond } from "util/paypal/server/api";
import { DOMAIN, PAYPALDOMAIN } from "util/paypal/server/domain";
import { generateAccessToken } from "util/paypal/server/auth";
import {OrderResponseBody} from "@paypal/paypal-js"
import { PayPalError } from "types/paypal";
import Joi from "joi";
import { validateSchemaGenerator } from "util/typeValidate";

export type approvePayPalProps = { token: string }
const approvePayPalPropsSchema = Joi.object({ token: Joi.string().required() })
const [vApprovePayPalProps, vApprovePayPalError] = validateSchemaGenerator<approvePayPalProps>(approvePayPalPropsSchema)
export type approvePayPalRes = { redirect_link: string }

export default async function (req: NextApiRequest, res: NextApiResponse) {
	if (!vApprovePayPalProps(req.body)) return apiRespond(res, "error", vApprovePayPalError(req.body))
	const { token } = req.body

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