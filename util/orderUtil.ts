import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore"
import { FirestoreOrderInterface, OrderInterface, OrderProduct, OrderProductFilled } from "types/order"
import { getProductByID } from "./productUtil"

export const fillOrder = async (orderDoc: QueryDocumentSnapshot<DocumentData>) => {
	const preOrder = orderDoc.data() as FirestoreOrderInterface
	return {
		...preOrder,
		dateTS: undefined,
		date: preOrder.dateTS.toDate(),
		firebaseOrderID: orderDoc.id
	} as OrderInterface
}

export const fillOrderProduct = async (emptyProducts: OrderProduct): Promise<OrderProductFilled> => ({ ...emptyProducts, product: await getProductByID(emptyProducts.PID) })
export const fillOrderProducts = async (emptyProducts: OrderProduct[]): Promise<OrderProductFilled[]> => await Promise.all(emptyProducts.map(fillOrderProduct))