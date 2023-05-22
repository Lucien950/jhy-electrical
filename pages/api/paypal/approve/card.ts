// api
import { NextApiRequest, NextApiResponse } from "next";
import { apiRespond } from "util/api";
import { generateAccessToken } from "util/paypal/server/auth";
import { OrderResponseBody } from "@paypal/paypal-js"
import { PayPalError, PaymentSource } from "types/paypal";
import { Card, validateCard, validateCardError } from "types/card";
import { PAYPALDOMAIN } from "util/domain";

export type approveCardProps = { token: string } & Card
export type approveCardRes = {newPaymentSource: PaymentSource}
export default async function (req: NextApiRequest, res: NextApiResponse){
	const { token, cardName, cardNumber, cardCVV, cardExpiry } = req.body as approveCardProps
	// presence
	if (!token) return apiRespond(res, "error", "No token provided")
	if (typeof token != "string") return apiRespond(res, "error", "OrderID not a string")
	if (!(cardName && cardNumber && cardCVV && cardExpiry)) return apiRespond(res, "error", "Missing card information")
	// formatting
	if (!validateCard({ cardName, cardNumber, cardCVV, cardExpiry }))
		//eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return apiRespond(res, "error", validateCardError({ cardName, cardNumber, cardCVV, cardExpiry })!.message)

	const response = await fetch(`${PAYPALDOMAIN}/v2/checkout/orders/${token}/confirm-payment-source`, {
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
	if (!response.ok) { return apiRespond(res, "error", await response.json() as PayPalError) }

	const order = await response.json() as OrderResponseBody
	if(!order.payment_source) return apiRespond(res, "error", "No payment source found")
	const newPaymentSource = order.payment_source as PaymentSource
	return apiRespond(res, "response", {newPaymentSource} as approveCardRes)
}