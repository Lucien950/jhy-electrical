import { Timestamp } from "firebase/firestore";
import productType from "./product";
import { Address } from "@paypal/paypal-js"

interface productInfo{
	PID: string,
	quantity: number,
	// fill later
	product?: productType
}

interface OrderInterface {
	products: productInfo[],
	orderPrice: Price,
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
interface FirestoreOrderInterface extends OrderInterface{
	// because of serialization sadge
	date: never,
	dateTS: Timestamp,
}

interface Price{
	subtotal: number,
	shipping: number,
	tax: number,
	total: number
}

export type { OrderInterface, FirestoreOrderInterface, productInfo, Price }