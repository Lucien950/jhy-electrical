import Joi from "joi"
import { attemptSchemaGenerator, validateSchemaFunctionsGenerator } from "util/typeValidate"

export interface FirebaseProduct {
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
	images: string[],
}
export interface Product extends FirebaseProduct {
	// productImageURL: string, //for fetching from storage
	firestoreID: string,
}
const productVariantListingSchema = Joi.object({
	sku: Joi.string().required(),
	label: Joi.string().required(),

	length: Joi.number().required().greater(0),
	width: Joi.number().required().greater(0),
	height: Joi.number().required().greater(0),
	weight: Joi.number().required().greater(0),

	quantity: Joi.number().required().min(0),
	price: Joi.number().required().greater(0),
	color: Joi.string().required(),
	images: Joi.array().items(Joi.string()).required(), // TODO make this min(1) once each variant has at least one image
})
const firebaseProductSchema = Joi.object({
	productName: Joi.string().required(),
	description: Joi.string().required(),
	commercial: Joi.boolean().required(),
	industrial: Joi.boolean().required(),
	residential: Joi.boolean().required(),
	variants: Joi.array().items(productVariantListingSchema).required().min(1),
})
const productSchema = firebaseProductSchema.append({
	firestoreID: Joi.string(),
})
export const validateProduct = validateSchemaFunctionsGenerator<Product>(productSchema)
export const attemptProduct = attemptSchemaGenerator<Product>(productSchema)

export const validateFirebaseProduct = validateSchemaFunctionsGenerator<FirebaseProduct>(firebaseProductSchema)
export const attemptFirebaseProduct = attemptSchemaGenerator<FirebaseProduct>(firebaseProductSchema)

export interface ProductWithVariant extends Omit<Product & ProductVariantListing, "variants"> { }