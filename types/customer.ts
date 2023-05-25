import { Address } from "@paypal/paypal-js"
import { PaymentSource, addressSchema } from "./paypal"
import Joi from "joi"
import { validateSchemaFunctionsGenerator } from "util/typeValidate"

export interface FinalCustomerInterface{
	fullName: string,
	paymentMethod: "card" | "paypal",
	payment_source: PaymentSource,
	
	// only when moving around, not on UI?
	address: Address
}
// TODO make sure this doesn't break anything
export type CustomerInterface = Partial<FinalCustomerInterface>

export const nameSchema = Joi.string().required().min(1).max(300)
export const finalCustomerSchema = Joi.object({
	fullName: nameSchema,
	paymentMethod: Joi.string().valid("card", "paypal").required(),
	// don't need to validate payment source because that is auto handled by the paypal api
	payment_source: Joi.any().required(),
	address: addressSchema.required(),
})

export const [validateName, validateNameError] = validateSchemaFunctionsGenerator<string>(nameSchema)
export const [validateFinalCustomer, validateFinalCustomerError] = validateSchemaFunctionsGenerator<FinalCustomerInterface>(finalCustomerSchema)