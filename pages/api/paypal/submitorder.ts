import { NextApiRequest, NextApiResponse } from "next"
// paypal
import { generateAccessToken } from "util/paypal/auth"
import { getOrder } from "util/paypal/getOrder"
// types
import { getProductByID } from "util/productUtil"
import ProductInterface from "types/product"
import { FirestoreOrderInterface } from "types/order"
// firebase
import { Timestamp, addDoc, collection } from "firebase/firestore"
import { db } from "util/firebase/firestore"
import { apiRespond } from "util/api"

export type submitOrderProps = { token: string }
export type submitOrderRes = { orderID: string }

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { token }: submitOrderProps = JSON.parse(req.body)
	if (!token) {
		apiRespond(res, "error", "Token is required to submit order")
		return
	}

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await generateAccessToken()}`
		},
	};

	const authResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/authorize`, options)
	if (!authResponse.ok) {
		apiRespond(res, "error", await authResponse.json())
		return
	}

	const order = await getOrder(token).catch(apiRespond(res, "error"))
	if (!order) return

	const { products: productIDs, paymentInformation, customerInformation } = order
	const cart = await Promise.all(productIDs.map(async p => {
		const product = (await getProductByID(p.PID).catch(apiRespond(res, "error")))
		|| 	{
					productName: "PRODUCT NOT FOUND",
					quantity: 0,
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

		name: `${customerInformation.first_name} ${customerInformation.last_name}`,
		email: customerInformation.payment_source?.paypal?.email_address,
		address: customerInformation.address,
		paypalOrderID: token,
	} as FirestoreOrderInterface

	const doc = await addDoc(collection(db, "orders"), newOrder).catch(apiRespond(res, "error"))
	if (!doc) return
	
	apiRespond<submitOrderRes>(res, "response", { orderID: doc.id })
}