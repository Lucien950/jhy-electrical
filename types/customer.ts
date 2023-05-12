import {Address} from "@paypal/paypal-js"
export default interface CustomerInterface {
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

// TODO what information does card require
interface cardInfo{
	
}

export type { paypalInfo }