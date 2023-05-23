import Joi from "joi"

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

const productSchema = Joi.object({
	productName: Joi.string().required(),
	quantity: Joi.number().required().greater(0),
	price: Joi.number().required().greater(0),
	description: Joi.string().required(),

	commercial: Joi.boolean().optional(),
	industrial: Joi.boolean().optional(),
	residential: Joi.boolean().optional(),

	length: Joi.number().required().greater(0),
	width: Joi.number().required().greater(0),
	height: Joi.number().required().greater(0),
	weight: Joi.number().required().greater(0),

	productImageURL: Joi.string(),
	firestoreID: Joi.string(),
})

export const validateProductError = (candidate: ProductInterface) => productSchema.validate(candidate).error
export const validateProduct = (candidate: ProductInterface) => validateProductError(candidate) === undefined

export const DEFAULT_PRODUCT = {
	productName: "", 
	quantity: -1, price: -1, 
	description: "", 
	commercial: false, industrial: false, residential: false, 
	length: -1, width: -1, height: -1, weight: -1
} as ProductInterface