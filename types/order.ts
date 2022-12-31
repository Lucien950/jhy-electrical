import { Timestamp } from "firebase/firestore";
import productType from "./product";

interface productInfo{
	PID: string,
	quantity: number,
	// fill later
	product?: productType
}

interface order {
	products: productInfo[],
	orderPrice: number,
	// byo
	orderID: string,
	// convert
	date: Date,

	//only present on failure orders
	failureReason?: string,
}
interface firestoreOrder{
	products: productInfo[],
	orderPrice: number,
	orderID: string,
	dateTS: Timestamp,
	
	//only present on failure orders
	failureReason?: string,
}

export type { order, firestoreOrder, productInfo }