import Joi from "joi";
import { attemptSchemaGenerator, validateSchemaFunctionsGenerator } from "util/typeValidate";

export const formCardSchema = Joi.object({
	cardName: Joi.string().min(1).max(300).required(),
	cardNumber: Joi.string().creditCard().required(),
	cardCVV: Joi.string().length(3).required(),
	cardExpiry: Joi.string().pattern(new RegExp("^[0-9]{4}-(0[1-9]|1[0-2])$")).required()
})
export type FormCard = {
	cardName: string,
	cardNumber: string,
	cardCVV: string,
	cardExpiry: string
}

export const validateCard = validateSchemaFunctionsGenerator<FormCard>(formCardSchema)
export const attemptCard = attemptSchemaGenerator<FormCard>(formCardSchema)