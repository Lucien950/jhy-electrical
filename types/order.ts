import { Timestamp } from "firebase/firestore";
import { Timestamp as TimestampAdmin } from "firebase-admin/firestore";
import { ProductVariantInterface, productVariantSchema } from "./product";
import { Address } from "./address";
import { FinalPriceInterface } from "types/price";
import Joi from "joi";
import { PaymentSource } from "./paypal";
import { validateSchemaFunctionsGenerator } from "util/typeValidate";

// ORDERS
export interface BaseOrderInterface {
	products: OrderProduct[],
	completed: boolean,
	dateTS: Timestamp | TimestampAdmin,
	// price information
	orderPrice: FinalPriceInterface,
	// customer information
	name: string,
	address: Address,
	paypalOrderID: string,
	payment_source: PaymentSource,
}
export interface FirebaseOrderInterface extends BaseOrderInterface {
	products: OrderProductFilled[],
}
export interface SerializedOrderInterface extends Omit<BaseOrderInterface, "dateTS"> {
	// because of serialization sadge
	date: Date,
	firebaseOrderID: string,
}
export interface OrderInterface extends SerializedOrderInterface {
	// order metadata
	products: OrderProductFilled[],
}

// ORDER PRODUCTS
export interface OrderProduct {
	PID: string,
	quantity: number,
	variantSKU: string, // variants
}
export interface OrderProductFilled extends OrderProduct {
	product: ProductVariantInterface
}
export const orderProductSchema = Joi.object({
	PID: Joi.string().required(),
	quantity: Joi.number().greater(0).required(),
	variantSKU: Joi.string().required(),
})
export const orderProductFilledSchema = Joi.object({
	PID: Joi.string().required(),
	quantity: Joi.number().greater(0).required(),
	variantSKU: Joi.string().required(),
	product: productVariantSchema.required(),
})

export const validateOrderProduct = validateSchemaFunctionsGenerator<OrderProduct>(orderProductSchema)
export const validateOrderProductFilled = validateSchemaFunctionsGenerator<OrderProductFilled>(orderProductFilledSchema)
export const validateOrderProductFilledList = validateSchemaFunctionsGenerator<OrderProductFilled[]>(Joi.array().items(orderProductFilledSchema).required().min(1))