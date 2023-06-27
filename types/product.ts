import Joi from "joi"
import { validateSchemaFunctionsGenerator } from "util/typeValidate"

export interface FirebaseProductInterface {
	productName: string,
	description: string,

	commercial: boolean,
	industrial: boolean,
	residential: boolean,

	variants: ProductVariantListing[]
}
export interface ProductVariantListing {
	sku: string,
	label: string,

	length: number,
	width: number,
	height: number,
	weight: number,

	quantity: number,
	price: number,
	color: string,
}
export interface ProductInterface extends FirebaseProductInterface {
	productImageURL: string, //for fetching from storage
	firestoreID: string,
}
const productVariantListingSchema = Joi.object({
	sku: Joi.string().required(),
	label: Joi.string().required(),

	length: Joi.number().required().greater(0),
	width: Joi.number().required().greater(0),
	height: Joi.number().required().greater(0),
	weight: Joi.number().required().greater(0),

	quantity: Joi.number().required().greater(0),
	price: Joi.number().required().greater(0),
	color: Joi.string().required(),
})
export const productSchema = Joi.object({
	productName: Joi.string().required(),
	description: Joi.string().required(),

	commercial: Joi.boolean(),
	industrial: Joi.boolean(),
	residential: Joi.boolean(),

	variants: Joi.array().items(productVariantListingSchema).required().min(1),

	productImageURL: Joi.string(),
	firestoreID: Joi.string(),
})
export const [validateProduct, validateProductError] = validateSchemaFunctionsGenerator<ProductInterface>(productSchema)

export interface ProductVariantInterface extends Omit<ProductInterface & ProductVariantListing, "variants"> { }
export const productVariantSchema = Joi.object({
	productName: Joi.string().required(),
	description: Joi.string().required(),

	commercial: Joi.boolean(),
	industrial: Joi.boolean(),
	residential: Joi.boolean(),

	productImageURL: Joi.string(),
	firestoreID: Joi.string(),

	sku: Joi.string().required(),
	label: Joi.string().required(),

	length: Joi.number().required().greater(0),
	width: Joi.number().required().greater(0),
	height: Joi.number().required().greater(0),
	weight: Joi.number().required().greater(0),

	quantity: Joi.number().required().greater(0),
	price: Joi.number().required().greater(0),
	color: Joi.string().required(),
})
