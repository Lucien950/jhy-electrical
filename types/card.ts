import Joi from "joi";

export const cardSchema = Joi.object({
	cardName: Joi.string().min(1).max(300).required(),
	cardNumber: Joi.string().creditCard().required(),
	cardCVV: Joi.string().length(3).required(),
	cardExpiry: Joi.string().pattern(new RegExp("^[0-9]{4}-(0[1-9]|1[0-2])$")).required()
})
export type Card = {
	cardName: string,
	cardNumber: string,
	cardCVV: string,
	cardExpiry: string
}

export const validateCardError = (candidate: Card) => cardSchema.validate(candidate).error
export const validateCard = (candidate: Card) => validateCardError(candidate) === undefined

export type CardInfoInterface = { cardName: string, cardNumber: string, cardExpiry: string, cardCVV: string }