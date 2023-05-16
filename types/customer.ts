import {Address} from "@paypal/paypal-js"
import { PaymentSource } from "./paypalTypes"
export default interface CustomerInterface {
	first_name?: string,
	last_name?: string,
	paymentMethod?: "card" | "paypal" | null,
	payment_source?: PaymentSource

	// only when moving around, not on UI?
	address?: Address
}