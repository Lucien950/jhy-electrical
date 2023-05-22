// paypal
import { PAYPALDOMAIN } from "util/domain";
import { getOrder } from "./getOrderFetch";
import { generateAccessToken } from "./auth";
// types
import { FirestoreOrderInterface, OrderProduct } from "types/order";
// firestore
import { db } from "util/firebase/firestore";
import { Timestamp, addDoc, collection } from "firebase/firestore";
import { PriceInterface } from "types/price";
import { CustomerInterface } from "types/customer";

export const submitOrderFetch = async (token: string, cart: OrderProduct[], customerInfo: CustomerInterface, priceInfo: PriceInterface) => {
	// authorize payment
	const options = { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await generateAccessToken()}` }, };
	const authResponse = await fetch(`${PAYPALDOMAIN}/v2/checkout/orders/${token}/authorize`, options)
	if (!authResponse.ok) throw await authResponse.json()


	// add order to firebase
	const newOrder = {
		products: cart,
		orderPrice: priceInfo,
		completed: false,
		dateTS: Timestamp.now(),

		name: customerInfo.fullName,
		payment_source: customerInfo.payment_source,
		address: customerInfo.address,
		paypalOrderID: token,
	} as FirestoreOrderInterface
	const doc = await addDoc(collection(db, "orders"), newOrder)

	return {firebaseOrderID: doc.id}
}