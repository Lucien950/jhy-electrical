import { addressSchema } from "./address"
import Joi from "joi"
import { validateSchemaFunctionsGenerator } from "util/typeValidate"
import { PaymentSource } from "./paypal"
import {Address} from "./address"

// TODO rethink where to put this?
export enum PaymentMethods {
	PayPal="paypal", Card="card"
}
export const isPaymentMethod = (x: any): x is PaymentMethods => x == "paypal" || x == "card"

export interface Customer{
	fullName: string,
	paymentMethod: PaymentMethods,
	paymentSource: PaymentSource,
	
	// only when moving around, not on UI?
	address: Address
}
export type FormCustomer = Partial<Customer>

export const nameSchema = Joi.string().required().min(1).max(300)
export const customerSchema = Joi.object({
	fullName: nameSchema,
	paymentMethod: Joi.string().valid("card", "paypal").required(),
	// don't need to validate payment source because that is auto handled by the paypal api
	paymentSource: Joi.object({
		card: Joi.object().optional(),
		paypal: Joi.object().optional(),
	}).required(),
	address: addressSchema.required(),
})

export const validateName = validateSchemaFunctionsGenerator<string>(nameSchema)
export const validateCustomer = validateSchemaFunctionsGenerator<Customer>(customerSchema)