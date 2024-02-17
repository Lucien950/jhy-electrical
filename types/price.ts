import Joi from "joi";
import { validateSchemaFunctionsGenerator } from "util/typeValidate";

export interface FormPrice {
	subtotal: number;
	total: number;
	shipping?: number;
	tax?: number;
}
export interface Price extends FormPrice {
	shipping: number;
	tax: number;
}
export const priceSchema = Joi.object({
	subtotal: Joi.number().required().greater(0),
	shipping: Joi.number().required().greater(0),
	tax: Joi.number().required().greater(0),
	total: Joi.number().required().greater(0),
})

export const validatePrice = validateSchemaFunctionsGenerator<Price>(priceSchema)