// api
import { NextApiRequest, NextApiResponse } from "next";
import { apiRespond } from "util/api";
import { generateAccessToken } from "util/paypal/server/auth";
import { OrderResponseBody } from "@paypal/paypal-js"
import { PaymentSource } from "types/paypal";
import { Card, cardSchema } from "types/card";

export type approveCardProps = { token: string } & Card
export type approveCardRes = {newPaymentSource: PaymentSource}
export default async function (req: NextApiRequest, res: NextApiResponse){
	const { token, cardName, cardNumber, cardCVV, cardExpiry } = req.body as approveCardProps
	// presence
	if (!token) return apiRespond(res, "error", "No token provided")
	if (typeof token != "string") return apiRespond(res, "error", "OrderID not a string")
	if (!(cardName && cardNumber && cardCVV && cardExpiry)) return apiRespond(res, "error", "Missing card information")
	// formatting
	const validateCardError = cardSchema.validate({ cardName, cardNumber, cardCVV, cardExpiry }).error?.message
	if (validateCardError) return apiRespond(res, "error", validateCardError)

	const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/confirm-payment-source`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${await generateAccessToken()}`
		},
		body: JSON.stringify({
			payment_source: {
				card: {
					name: cardName,
					number: cardNumber,
					security_code: cardCVV,
					expiry: cardExpiry
				}
			}
		})
	})
	const data = await response.json()
	if (!response.ok) { return apiRespond(res, "error", data) }
	
	const newPaymentSource = (data as OrderResponseBody).payment_source! as PaymentSource
	return apiRespond(res, "response", {newPaymentSource} as approveCardRes)
}