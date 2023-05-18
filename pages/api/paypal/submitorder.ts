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

export type submitOrderProps = { token: string }
export type submitOrderRes = { orderID: string }

/**
 * Submitting Order API Endpoint
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
	// INPUT VALIDATION
	const { token }: submitOrderProps = req.body
	if (!token) return apiRespond(res, "error", "Token is required to submit order")
	if (typeof token != "string") return apiRespond(res, "error", "Token is not a string")

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await generateAccessToken()}`
		},
	};

	const authResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/authorize`, options)
	if (!authResponse.ok) return apiRespond(res, "error", await authResponse.json())

	try{
		const order = await getOrder(token)
	
		const { products: productIDs, paymentInformation, customerInformation } = order
		const cart = await Promise.all(productIDs.map(async p => {
			const product = await getProductByID(p.PID)
			|| 	{
						productName: `PRODUCT ${p.PID} NOT FOUND`,
						quantity: p.quantity,
						price: 1,
						description: "COULD NOT FIND PRODUCT WHEN SUBMITTING ORDER"
					} as ProductInterface
			return { ...p, product }
		}))
	
		const newOrder = {
			products: cart,
			orderPrice: paymentInformation,
			completed: true,
			dateTS: Timestamp.now(),
	
			name: customerInformation.fullName,
			email: customerInformation.payment_source?.paypal?.email_address,
			address: customerInformation.address,
			paypalOrderID: token,
		} as FirestoreOrderInterface
	
		const doc = await addDoc(collection(db, "orders"), newOrder)
		apiRespond<submitOrderRes>(res, "response", { orderID: doc.id })
	}
	catch(e){
		apiRespond(res, "error", e)
	}
}