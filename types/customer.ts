import { addressSchema } from "./address"
import Joi from "joi"
import { validateSchemaFunctionsGenerator } from "util/typeValidate"
import { PaymentSource } from "./paypal"
import {Address} from "./address"

export interface FinalCustomerInterface{
	fullName: string,
	paymentMethod: "card" | "paypal",
	payment_source: PaymentSource,
	
	// only when moving around, not on UI?
	address: Address
}
export type CustomerInterface = Partial<FinalCustomerInterface>

export const nameSchema = Joi.string().required().min(1).max(300)
export const finalCustomerSchema = Joi.object({
	fullName: nameSchema,
	paymentMethod: Joi.string().valid("card", "paypal").required(),
	// don't need to validate payment source because that is auto handled by the paypal api
	payment_source: Joi.object({
		card: Joi.object().optional(),
		paypal: Joi.object().optional(),
	}).required(),
	address: addressSchema.required(),
})

export const validateName = validateSchemaFunctionsGenerator<string>(nameSchema)
export const validateFinalCustomer = validateSchemaFunctionsGenerator<FinalCustomerInterface>(finalCustomerSchema)