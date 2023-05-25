import { clientErrorFactory } from "util/paypal/client/clientErrorFactory"
// API types
import { apiResponse } from "util/paypal/server/api"
import { approveCardProps, approveCardRes } from "pages/api/paypal/approve/card"
import { approvePayPalRes } from "pages/api/paypal/approve/paypal"
// types
import { CardInfoInterface, validateCard, validateCardError } from "types/card"

// https://youtu.be/fzwkkZp5WcE?t=1m30s
// https://developer.paypal.com/docs/checkout/integrate/#6-verify-the-transaction
const approveCardError = clientErrorFactory("Approve Card Server Side Error: Check Console for more details")
export const approveCard = async (token: string, cardInfo: Partial<CardInfoInterface>)=>{
	if (!validateCard(cardInfo as CardInfoInterface))
		return approveCardError(validateCardError(cardInfo as CardInfoInterface))
	const response = await fetch("/api/paypal/approve/card", {
		method: "PATCH",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token, card: cardInfo } as approveCardProps)
	})
	const {res, err} = await response.json() as apiResponse<approveCardRes, any>
	if(response.ok){
		return res!
	}
	else return approveCardError(err)
}

export const approvePayPal = async (token: string) => {
	const response = await fetch("/api/paypal/approve/paypal", {
		method: "PATCH",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token } as approveCardProps)
	})
	const { res, err } = await response.json() as apiResponse<approvePayPalRes, any>
	if (response.ok) return res!
	else return approveCardError(err)
}