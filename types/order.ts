import { Timestamp } from "firebase/firestore";
import productType from "./product";
import { Address } from "@paypal/paypal-js"

interface productInfo{
	PID: string,
	quantity: number,
	// fill later
	product?: productType
}

interface order {
	products: productInfo[],
	orderPrice: Price,
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
interface firestoreOrder{
	// product important
	products: productInfo[],
	orderPrice: Price,
	dateTS: Timestamp,
	// customer information
	name:string,
	email:string,
	address: Address,
	paypalOrderID: string,
	
	//only present on failure orders
	failureReason?: string,
}

interface Price{
	subtotal: number,
	shipping: number,
	tax: number,
	total: number
}

export type { order, firestoreOrder, productInfo, Price }