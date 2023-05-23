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
export interface ProductInterfaceFile extends ProductInterface{
	productImageFile: File | null, // for uploading
}

const productSchema = Joi.object({
	productName: Joi.string().required(),
	quantity: Joi.number().required(),
	price: Joi.number().required(),
	description: Joi.string().required(),
	productImage: Joi.string().required(),

	commercial: Joi.boolean().optional(),
	industrial: Joi.boolean().optional(),
	residential: Joi.boolean().optional(),

	length: Joi.number().required(),
	width: Joi.number().required(),
	height: Joi.number().required(),
	weight: Joi.number().required(),

	productImageURL: Joi.string(),
	productImageFile: Joi.any(),
})

export const validateProductError = (candidate: ProductInterface) => productSchema.validate(candidate).error
export const validateProduct = (candidate: ProductInterface) => validateProductError(candidate) === undefined

export const DEFAULT_PRODUCT = { productName: "", quantity: 0, price: 0, description: "", commercial: false, industrial: false, residential: false, length: 0, width: 0, height: 0, weight: 0, } as ProductInterface