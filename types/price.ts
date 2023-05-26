import Joi from "joi";
import { validateSchemaFunctionsGenerator } from "util/typeValidate";

export interface PriceInterface {
	subtotal: number;
	total: number;
	shipping?: number;
	tax?: number;
}
export interface FinalPriceInterface extends PriceInterface {
	shipping: number;
	tax: number;
}
export const finalPriceSchema = Joi.object({
	subtotal: Joi.number().required().greater(0),
	shipping: Joi.number().required().greater(0),
	tax: Joi.number().required().greater(0),
	total: Joi.number().required().greater(0),
})

export const [validateFinalPrice, validateFinalPriceError] = validateSchemaFunctionsGenerator<FinalPriceInterface>(finalPriceSchema)