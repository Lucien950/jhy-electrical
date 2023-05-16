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

export type submitOrderProps = { token: string }
export type submitOrderError = { error_message: string }
export type submitOrderRes = { orderID: string }
export type submitOrderReturn = { res?: submitOrderRes, err?: submitOrderError }

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { token }: submitOrderProps = JSON.parse(req.body)
	if (!token) {
		res.status(500).send({ error_message: "Token is required to submit order" } as submitOrderError)
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
		res.status(500).send({ err: { error_message: JSON.stringify(await authResponse.json()) } } as submitOrderReturn)
		return
	}

	const order = await getOrder(token).catch(e => res.status(500).send({err: { error_message: e.message }} as submitOrderReturn))
	if (!order) return

	const { products: productIDs, paymentInformation, customerInformation } = order
	const cart = await Promise.all(productIDs.map(async p => {
		const product = (await getProductByID(p.PID).catch(e => res.status(500).send({ err: { error_message: e.message } } as submitOrderReturn)))
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

	const doc = await addDoc(collection(db, "orders"), newOrder).catch(e=>res.status(500).send({err: {error_message: e.message}}))
	if (!doc) return
	
	res.status(200).send({
		res: {
			orderID: doc.id
		}
	} as submitOrderReturn)
}