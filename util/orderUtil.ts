import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore"
import { FirestoreOrderInterface, OrderInterface } from "types/order"

const fillOrder = async (orderDoc: QueryDocumentSnapshot<DocumentData>) => {
	const preOrder = orderDoc.data() as FirestoreOrderInterface
	return {
		...preOrder,
		dateTS: undefined,
		date: preOrder.dateTS.toDate(),
		orderID: orderDoc.id
	} as OrderInterface
}

export { fillOrder }