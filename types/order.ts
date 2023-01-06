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
	orderPrice: number,
	// convert
	date: Date,
	// customer information
	name:string,
	email:string,
	address: Address,
	phone:string,
	paypalOrderID: string,
	
	// byo
	orderID: string,
	//only present on failure orders
	failureReason?: string,
}
interface firestoreOrder{
	// product important
	products: productInfo[],
	orderPrice: number,
	dateTS: Timestamp,
	//byo
	orderID: string,
	// customer information
	name:string,
	email:string,
	address: Address,
	phone:string,
	paypalOrderID: string,

	
	//only present on failure orders
	failureReason?: string,
}

export type { order, firestoreOrder, productInfo }