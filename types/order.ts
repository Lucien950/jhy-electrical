import { Timestamp } from "firebase/firestore";
import { Timestamp as TimestampAdmin } from "firebase-admin/firestore";
import { ProductVariantInterface, productVariantSchema } from "./product";
import { Address } from "./address";
import { FinalPriceInterface } from "types/price";
import Joi from "joi";
import { PaymentSource } from "./paypal";
import { validateSchemaFunctionsGenerator } from "util/typeValidate";

// ORDER PRODUCTS
export interface OrderProduct {
	PID: string,
	quantity: number,
	// variants
	variantSKU: string,
}
export interface OrderProductFilled extends OrderProduct {
	product: ProductVariantInterface
}

// ORDERS
export interface EmptyOrderInterface {
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
export interface FirebaseOrderInterface extends EmptyOrderInterface {
	products: OrderProductFilled[],
}
export interface SerializedOrderInterface extends Omit<EmptyOrderInterface, "dateTS"> {
	// because of serialization sadge
	date: Date,
	firebaseOrderID: string,
}
export interface OrderInterface extends SerializedOrderInterface {
	// order metadata
	products: OrderProductFilled[],
}

// VALIDATIONS
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

export const [validateOrderProduct, validateOrderProductError] = validateSchemaFunctionsGenerator<OrderProduct>(orderProductSchema)
export const [validateOrderProductFilled, validateOrderProductFilledError] = validateSchemaFunctionsGenerator<OrderProductFilled>(orderProductFilledSchema)
export const [validateOrderProductFilledList, validateOrderProductFilledListError] = validateSchemaFunctionsGenerator<OrderProductFilled[]>(Joi.array().items(orderProductFilledSchema).required().min(1))