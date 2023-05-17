import { Timestamp } from "firebase/firestore";
import { ProductInterface } from "./product";
import { Address } from "@paypal/paypal-js"
import { FinalPriceInterface } from "util/priceUtil";
import Joi from "joi";

export interface OrderProduct{
	PID: string,
	quantity: number,
	// fill later
	product?: ProductInterface
}

export interface OrderInterface {
	products: OrderProduct[],
	orderPrice: FinalPriceInterface,
	completed: boolean,
	// convert
	date: Date,
	// customer information
	name:string,
	email:string,
	address: Address,
	paypalOrderID: string,
	
	// byo
	orderID: string,
	//only present on failure orders
	failureReason?: string,
}
export interface FirestoreOrderInterface extends OrderInterface{
	// because of serialization sadge
	date: never,
	dateTS: Timestamp,
}

const orderProductSchema = Joi.object({
	PID: Joi.string().required(),
	quantity: Joi.number().required(),
})
export const validateOrderProduct = (candidate: OrderProduct) => orderProductSchema.validate(candidate)
