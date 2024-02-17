// types
import { CardInfoInterface, validateCard } from "types/card"
import { approveCardProps, approveCardRes } from "app/api/paypal/approve/card"
import { approvePayPalRes } from "app/api/paypal/approve/paypal"
import { apiResponse } from "server/api"

// https://youtu.be/fzwkkZp5WcE?t=1m30s
// https://developer.paypal.com/docs/checkout/integrate/#6-verify-the-transaction
export const approveCard = async (token: string, cardInfo: Partial<CardInfoInterface>)=>{
	validateCard(cardInfo)
	const response = await fetch("/api/paypal/approve/card", {
		method: "PATCH",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token, card: cardInfo } as approveCardProps)
	})
	const {res, err} = await response.json() as apiResponse<approveCardRes, unknown>
	if(response.ok){
		return res!
	}
	else throw err
}

export const approvePayPal = async (token: string) => {
	const response = await fetch("/api/paypal/approve/paypal", {
		method: "PATCH",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token } as approveCardProps)
	})
	const { res, err } = await response.json() as apiResponse<approvePayPalRes, unknown>
	if (response.ok) return res!
	else throw err
}