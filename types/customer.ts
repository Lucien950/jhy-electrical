import { Address } from "@paypal/paypal-js"
import { PaymentSource } from "./paypal"
export default interface CustomerInterface {
	fullName?: string,
	paymentMethod?: "card" | "paypal" | null,
	payment_source?: PaymentSource

	// only when moving around, not on UI?
	address?: Address
}