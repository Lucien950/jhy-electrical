import Joi from "joi"
import { validateSchemaFunctionsGenerator } from "util/typeValidate"

type cm = number
type kg = number

export interface FirebaseProductInterface{
	productName: string,
	quantity: number,
	price: number,
	description: string,

	commercial: boolean,
	industrial: boolean,
	residential: boolean,

	length: cm,
	width: cm,
	height: cm,
	weight: kg,
}
export interface ProductInterface extends FirebaseProductInterface {
	productImageURL: string, //for fetching from storage
	firestoreID: string,
}

export const productSchema = Joi.object({
	productName: Joi.string().required(),
	quantity: Joi.number().required().greater(0),
	price: Joi.number().required().greater(0),
	description: Joi.string().required(),

	commercial: Joi.boolean(),
	industrial: Joi.boolean(),
	residential: Joi.boolean(),

	length: Joi.number().required().greater(0),
	width: Joi.number().required().greater(0),
	height: Joi.number().required().greater(0),
	weight: Joi.number().required().greater(0),

	productImageURL: Joi.string(),
	firestoreID: Joi.string(),
})

export const [validateProduct, validateProductError] = validateSchemaFunctionsGenerator<ProductInterface>(productSchema)