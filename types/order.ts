import { Timestamp } from "firebase/firestore";
import productType from "./product";

interface productInfo{
	PID: string,
	quantity: number,
	product: productType
}

interface order {
	products: productInfo[],
	// byo
	orderID: string,
	// convert
	date: Date,
}
interface firestoreOrder{
	products: productInfo[],
	dateTS: Timestamp,
}

export type { order, firestoreOrder, productInfo }