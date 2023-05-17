import Joi from "joi"

type cm = number
type kg = number
export interface ProductInterface{
	productName: string,
	quantity: number,
	price: number,
	description: string,
	productImage: string, // name of file inside firebase storage, not the URL
	
	commercial: boolean,
	industrial: boolean,
	residential: boolean,

	length: cm,
	width: cm,
	height: cm,
	weight: kg,


	// THESE MUST BE SUPPLEMENTED
	productImageURL?: string, //for fetching from storage
	productImageFile?: File, // for uploading

	firestoreID: string,
}

const productSchema = Joi.object({
	productName: Joi.string().required(),
	quantity: Joi.number().required(),
	price: Joi.number().required(),
	description: Joi.string().required(),
	productImage: Joi.string().required(),

	commercial: Joi.boolean().required(),
	industrial: Joi.boolean().required(),
	residential: Joi.boolean().required(),

	length: Joi.number().required(),
	width: Joi.number().required(),
	height: Joi.number().required(),
	weight: Joi.number().required(),

	productImageURL: Joi.string(),
	productImageFile: Joi.any(),

	firestoreID: Joi.string().required(),
})
export const validateProduct = (candidate: ProductInterface) => productSchema.validate(candidate)