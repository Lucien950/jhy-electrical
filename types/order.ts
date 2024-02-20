import { Timestamp } from "firebase/firestore";
import { Timestamp as TimestampAdmin } from "firebase-admin/firestore";
import { ProductWithVariant } from "./product";
import { Address } from "./address";
import { Price } from "types/price";
import Joi from "joi";
import { PaymentSource } from "./paypal";
import { validateSchemaFunctionsGenerator } from "util/typeValidate";

interface PRIVATE_filledOrderProduct extends OrderProduct {
	product: ProductWithVariant
}
/**
 * This is how it is stored in the firebase database
 */
export interface CompletedOrder {
	completed: boolean,
	dateTS: Timestamp | TimestampAdmin,
	// price information
	orderPrice: Price,
	// customer information
	name: string,
	address: Address,
	paypalOrderID: string,
	payment_source: PaymentSource,
	products: PRIVATE_filledOrderProduct[],
}

/**
 * This is the interface we use in the javascript. TODO consider changing this into a class.
 */
export interface Order extends Omit<CompletedOrder, "dateTS"> {
	// because of serialization sadge
	date: Date,
	firebaseOrderID: string,
}

// ORDER PRODUCTS
export interface OrderProduct {
	PID: string,
	quantity: number,
	variantSKU: string, // variants
}
export const orderProductSchema = Joi.object({
	PID: Joi.string().required(),
	quantity: Joi.number().greater(0).required(),
	variantSKU: Joi.string().required(),
})
export const validateOrderProduct = validateSchemaFunctionsGenerator<OrderProduct>(orderProductSchema)
export const validateOrderProductList = validateSchemaFunctionsGenerator<OrderProduct[]>(Joi.array().items(orderProductSchema).required().min(1))