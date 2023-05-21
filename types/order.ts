import { Timestamp } from "firebase/firestore";
import { ProductInterface } from "./product";
import { Address } from "@paypal/paypal-js"
import { FinalPriceInterface } from "types/price";
import Joi from "joi";
import { PaymentSource } from "./paypal";

export interface OrderProduct{
	PID: string,
	quantity: number,
	// fill later
	product?: ProductInterface
}
const orderProductSchema = Joi.object({
	PID: Joi.string().required(),
	quantity: Joi.number().greater(0).required(),
})
export const validateOrderProductError = (candidate: OrderProduct) => orderProductSchema.validate(candidate).error
export const validateOrderProduct = (candidate: OrderProduct) => validateOrderProductError(candidate) === undefined

export interface OrderInterface {
	products: OrderProduct[],
	orderPrice: FinalPriceInterface,
	completed: boolean,
	// convert
	date: Date,
	// customer information
	name:string,
	address: Address,
	paypalOrderID: string,
	payment_source: PaymentSource,
	
	// byo
	firebaseOrderID: string,
	//only present on failure orders
	failureReason?: string,
}
export interface FirestoreOrderInterface extends OrderInterface{
	// because of serialization sadge
	date: never,
	dateTS: Timestamp,
}
