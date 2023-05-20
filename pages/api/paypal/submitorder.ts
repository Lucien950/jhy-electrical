import { NextApiRequest, NextApiResponse } from "next"
// paypal
import { generateAccessToken } from "util/paypal/server/auth"
import { getOrder } from "util/paypal/server/getOrder"
// types
import { getProductByID } from "util/productUtil"
import { ProductInterface } from "types/product"
import { FirestoreOrderInterface } from "types/order"
// firebase
import { Timestamp, addDoc, collection } from "firebase/firestore"
import { db } from "util/firebase/firestore"
import { apiRespond } from "util/api"
import { validateCustomer, validateCustomerError } from "types/customer"
import { validateFinalPrice, validateFinalPriceError } from "types/price"

export type submitOrderProps = { token: string }
export type submitOrderRes = { firebaseOrderID: string }

/**
 * Submitting Order API Endpoint
 */
export default async function (req: NextApiRequest, res: NextApiResponse) {
	// INPUT VALIDATION
	const { token }: submitOrderProps = req.body
	if (!token) return apiRespond(res, "error", "Token is required to submit order")
	if (typeof token != "string") return apiRespond(res, "error", "Token is not a string")

	try{
		// make sure order is well formed before authorizing the payment
		const { products: productIDs, priceInfo, customerInfo, status } = await getOrder(token)

		// validation
		// validates p1 completion
		if (!validateCustomer(customerInfo)) {console.error("customer error"); return apiRespond(res, "error", validateCustomerError(customerInfo))}
		// this validates that p0 has been completed
		if (!validateFinalPrice(priceInfo)) { console.error("price error"); return apiRespond(res, "error", validateFinalPriceError(priceInfo))}
		if(status !== "APPROVED") return apiRespond(res, "error", "Order is not approved")

		// populate cart (fossilize the cart in case products change/are removed)
		const cart = await Promise.all(productIDs.map(async p => {
			const product = await getProductByID(p.PID)
			return { ...p, product }
		}))

		// add order to firebase
		const newOrder = {
			products: cart,
			orderPrice: priceInfo,
			completed: false,
			dateTS: Timestamp.now(),
	
			name: customerInfo.fullName,
			payment_source: customerInfo.payment_source, //problem
			address: customerInfo.address,
			paypalOrderID: token,
		} as FirestoreOrderInterface
		
		console.log(newOrder)
		const doc = await addDoc(collection(db, "orders"), newOrder)

		// authorize payment
		const options = { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await generateAccessToken()}` }, };
		const authResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/authorize`, options)
		if (!authResponse.ok) return apiRespond(res, "error", await authResponse.json())

		// POINT OF NO RETURN
		return apiRespond<submitOrderRes>(res, "response", { firebaseOrderID: doc.id })
	}
	catch(e){
		return apiRespond(res, "error", e)
	}
}