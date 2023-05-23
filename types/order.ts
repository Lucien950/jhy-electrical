import { Timestamp } from "firebase/firestore";
import { ProductInterface } from "./product";
import { Address } from "@paypal/paypal-js"
import { FinalPriceInterface } from "types/price";
import Joi from "joi";
import { PaymentSource } from "./paypal";

// ORDERS
export interface FirestoreOrderInterface {
	// order metadata
	products: OrderProduct[],
	completed: boolean,
	dateTS: Timestamp,
	// price information
	orderPrice: FinalPriceInterface,
	// customer information
	name:string,
	address: Address,
	paypalOrderID: string,
	payment_source: PaymentSource,
}
export interface OrderInterface extends FirestoreOrderInterface {
	// because of serialization sadge
	dateTS: never,
	date: Date,
	firebaseOrderID: string,
}

// ORDER PRODUCTS
export interface OrderProduct {
	PID: string,
	quantity: number,
	// fill later
	product?: ProductInterface
}
export interface OrderProductFilled extends OrderProduct {
	product: ProductInterface
}

const orderProductSchema = Joi.object({
	PID: Joi.string().required(),
	quantity: Joi.number().greater(0).required(),
})
export const validateOrderProductError = (candidate: OrderProduct) => orderProductSchema.validate(candidate).error
export const validateOrderProduct = (candidate: OrderProduct) => validateOrderProductError(candidate) === undefined
