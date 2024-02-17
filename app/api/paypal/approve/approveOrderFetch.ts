import { Card } from "types/card"
import { DOMAIN } from "../../../../types/domain"
import { PAYPALDOMAIN } from "app/api/paypal/paypalDomain"
import { generateAccessToken } from "server/paypal"
import { PayPalError } from "types/paypal"
import { OrderResponseBody } from "@paypal/paypal-js"

export const approveCardFetch = async (token: string, card: Card) => {
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
	if (!response.ok) throw await response.json() as PayPalError
	return await response.json() as OrderResponseBody
}

export const approvePayPalFetch = async (token: string) => {
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
						brand_name: "JHY Electrical",
						return_url: `${returnDomain}/checkout`,
						cancel_url: `${returnDomain}/checkout`,
					}
				}
			}
		})
	})
	if (!response.ok) await response.json() as PayPalError
	return await response.json() as OrderResponseBody
}