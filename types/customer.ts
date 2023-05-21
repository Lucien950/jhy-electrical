import { Address } from "@paypal/paypal-js"
import { PaymentSource, addressSchema } from "./paypal"
import Joi from "joi"
export interface CustomerInterface {
	fullName: string | null,
	paymentMethod: "card" | "paypal" | null,
	payment_source: PaymentSource | null

	// only when moving around, not on UI?
	address: Address | null
}

const nameSchema = Joi.string().required().min(1).max(300)
const customerSchema = Joi.object({
	fullName: nameSchema,
	paymentMethod: Joi.string().valid("card", "paypal").required(),
	// don't need to validate payment source because that is auto handled by the paypal api
	payment_source: Joi.any(),
	address: addressSchema.required(),
})
export const validateName = (candidate: string | null) => (nameSchema !== null) && (nameSchema.validate(candidate).error === undefined)
export const validateNameError = (candidate: string | null) => nameSchema.validate(candidate).error
export const validateCustomer = (candidate: CustomerInterface) => customerSchema.validate(candidate).error === undefined
export const validateCustomerError = (candidate: CustomerInterface) => customerSchema.validate(candidate).error