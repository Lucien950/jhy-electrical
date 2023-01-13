import {Address} from "@paypal/paypal-js"
export default interface customer {
	first_name: string,
	last_name: string,
	paymentMethod: "card" | "paypal" | "",
	paypalInfo?: paypalInfo,
	cardInfo?: cardInfo,

	// only when moving around, not on UI?
	address: Address
}

interface paypalInfo{
	// paypal
	paypalEmail	:string,
	token: string,
}

interface cardInfo{

}

export type { paypalInfo }