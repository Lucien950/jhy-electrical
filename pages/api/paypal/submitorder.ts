// api
import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler, apiRespond } from "server/api"
// types
import Joi from "joi"
import { validateSchema } from "util/typeValidate"
import { validateFinalCustomer, validateFinalCustomerError } from "types/customer"
import { validateFinalPrice, validateFinalPriceError } from "types/price"
// util
import { fillOrderProducts } from "util/orderUtil"
// paypal
import { getOrder } from "server/paypal/getOrderFetch"
import { submitOrderFetch } from "server/paypal/submitOrderFetch"
import { Timestamp } from "firebase-admin/firestore"
import { FirestoreOrderInterface } from "types/order"
// firebase
import { db } from "server/firebase/firestore"

export type submitOrderProps = { token: string }
export type submitOrderRes = { firebaseOrderID: string }
/**
 * Submitting Order API Endpoint
 */
async function submitOrderAPI(req: NextApiRequest, res: NextApiResponse) {
	// INPUT VALIDATION
	const { token } = validateSchema<submitOrderProps>(req.body, Joi.object({ token: Joi.string().required() }))

	// make sure order is well formed before authorizing the payment
	const { products: emptyProducts, priceInfo, customerInfo, status } = await getOrder(token)

	if (!(status === "COMPLETED" || status === "APPROVED")) throw "Order is not Approved"
	// validation, slightly optional, but just more hurdles
	// validates p1 completion
	if (!validateFinalCustomer(customerInfo)) { console.error("customer error"); throw validateFinalCustomerError(customerInfo) }
	// this validates that p0 has been completed
	if (!validateFinalPrice(priceInfo)) { console.error("price error"); throw validateFinalPriceError(priceInfo) }
	
	if (status === "COMPLETED"){
		const existingOrderRef = db.collection("orders").where("paypalOrderID", "==", token)
		const existingOrder = (await existingOrderRef.get()).docs[0]
		if(existingOrder !== undefined) throw "Order has already been completed"
	}

	// populate cart (fossilize the cart in case products change/are removed)
	// also validate that all the products are still valid one last time
	const cart = await fillOrderProducts(emptyProducts)
	
	if (status === "APPROVED") await submitOrderFetch(token)

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

	const { id: firebaseOrderID } = await db.collection("orders").add(newOrder)
	// const { id: firebaseOrderID } = await addDoc(collection(db, "orders"), newOrder)

	return apiRespond<submitOrderRes>(res, "response", { firebaseOrderID })
}

export default apiHandler({
	"POST": submitOrderAPI
})