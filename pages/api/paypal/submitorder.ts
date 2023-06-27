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
import { EmptyOrderInterface } from "types/order"
// firebase
import { db } from "server/firebase/firestore"
import { FirebaseProductInterface } from "types/product"

const isRejected = (input: PromiseSettledResult<unknown>): input is PromiseRejectedResult =>
	input.status === 'rejected'

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

	if (status === "COMPLETED") {
		const existingOrderRef = await db.collection("orders").where("paypalOrderID", "==", token).count().get()
		if (existingOrderRef.data().count != 0) throw "Order has already been completed"
	}

	// populate cart (fossilize the cart in case products change/are removed)
	// also validate that all the products are still valid one last time
	const cart = await fillOrderProducts(emptyProducts)

	if (status === "APPROVED") await submitOrderFetch(token)

	// add order to firebase
	const newOrder: EmptyOrderInterface = {
		products: cart,
		orderPrice: priceInfo,
		completed: false,
		dateTS: Timestamp.now(),

		name: customerInfo.fullName,
		payment_source: customerInfo.payment_source,
		address: customerInfo.address,
		paypalOrderID: token,
	}

	const { id: firebaseOrderID } = await db.collection("orders").add(newOrder)
	// const { id: firebaseOrderID } = await addDoc(collection(db, "orders"), newOrder)
	const decreaseProductQuantity = await Promise.allSettled(cart.map(async p => {
		const updateDoc = (await db.collection("products").doc(p.PID).get()).data() as FirebaseProductInterface
		const updateVariant = updateDoc.variants.find(v => v.sku === p.variantSKU)
		if (!updateVariant) throw "Variant not found"
		updateVariant.quantity -= p.quantity
		await db.collection("products").doc(p.PID).update({
			variants: [...updateDoc.variants.filter(v => v.sku !== p.variantSKU), updateVariant]
		})
	}))

	const failures = decreaseProductQuantity.filter(isRejected)
	if (failures.length > 0) {
		failures.forEach(p => console.error(p.reason))
		throw "Failed to update product quantities"
	}

	return { firebaseOrderID } as submitOrderRes
}

export default apiHandler({
	"POST": submitOrderAPI
})