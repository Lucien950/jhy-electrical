// api
import { NextApiRequest, NextApiResponse } from "next";
import { apiRespond } from "util/paypal/server/api";
import { generateAccessToken } from "util/paypal/server/auth";
import { OrderResponseBody } from "@paypal/paypal-js"
import { PayPalError, PaymentSource } from "types/paypal";
import { Card, cardSchema } from "types/card";
import { PAYPALDOMAIN } from "util/paypal/server/domain";
import Joi from "joi";
import { validateSchemaGenerator } from "util/typeValidate";

export type approveCardProps = { token: string, card: Card }
const approveCardPropsSchema = Joi.object({ token: Joi.string().required(), card: cardSchema.required() })
const [vApproveCardProps, vApproveCardPropsError] = validateSchemaGenerator<approveCardProps>(approveCardPropsSchema)
export type approveCardRes = {newPaymentSource: PaymentSource}

export default async function (req: NextApiRequest, res: NextApiResponse){
	if (!vApproveCardProps(req.body)) return apiRespond(res, "error", vApproveCardPropsError(req.body))	
	const { token, card } = req.body

	const response = await fetch(`${PAYPALDOMAIN}/v2/checkout/orders/${token}/confirm-payment-source`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${await generateAccessToken()}`
		},
		body: JSON.stringify({
			payment_source: {
				card: {
					name: card.cardName,
					number: card.cardNumber,
					security_code: card.cardCVV,
					expiry: card.cardExpiry
				}
			}
		})
	})
	if (!response.ok) return apiRespond(res, "error", await response.json() as PayPalError)

	const order = await response.json() as OrderResponseBody
	if(!order.payment_source) return apiRespond(res, "error", "No payment source found")
	const newPaymentSource = order.payment_source as PaymentSource
	return apiRespond(res, "response", {newPaymentSource} as approveCardRes)
}