import Joi from "joi";

export interface PriceInterface {
	subtotal: number;
	shipping?: number;
	tax: number;
	total: number;
}
export interface FinalPriceInterface extends PriceInterface {
	shipping: number;
}
const finalPriceSchema = Joi.object({
	subtotal: Joi.number().required(),
	shipping: Joi.number().required().greater(0),
	tax: Joi.number().required(),
	total: Joi.number().required(),
})
export const validateFinalPrice = (candidate: PriceInterface) => finalPriceSchema.validate(candidate).error === undefined
export const validateFinalPriceError = (candidate: PriceInterface) => finalPriceSchema.validate(candidate).error