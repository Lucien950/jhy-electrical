import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore"
import { FirestoreOrderInterface, OrderInterface, OrderProduct } from "types/order"
import { getProductByID } from "./productUtil"

export const fillOrder = async (orderDoc: QueryDocumentSnapshot<DocumentData>) => {
	const preOrder = orderDoc.data() as FirestoreOrderInterface
	return {
		...preOrder,
		dateTS: undefined,
		date: preOrder.dateTS.toDate(),
		orderID: orderDoc.id
	} as OrderInterface
}

export const fillOrderProduct = async (productID: OrderProduct) => ({ ...productID, product: await getProductByID(productID.PID) })
export const fillOrderProducts = async (productIDs: OrderProduct[]) => await Promise.all(productIDs.map(fillOrderProduct))