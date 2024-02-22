// types
import { Customer, attemptCustomer } from "types/customer"
import { Price, attemptPrice } from "types/price"
// util
import { fillOrderProducts } from "util/order"
// paypal
import { generateAccessToken, getPayPalOrder } from 'server/paypal'
import { Timestamp } from "firebase-admin/firestore"
import { CompletedOrder, OrderProduct } from "types/order"
// firebase
import { db } from "server/firebase/firestore"
import { FirebaseProduct } from "types/product"
import { attemptSubmitOrderProps, submitOrderRes } from "."
import { apiHandler } from "server/api"
import { PAYPALDOMAIN } from "../../paypalDomain"
import { PayPalAuthorizePaymentSuccess } from "types/paypal"

const firebaseLogOrder = async (orderProducts: OrderProduct[], priceInfo: Price, customerInfo: Customer, paypalToken: string) => {
	// TODO finish this
	const id = await db.runTransaction(async (transaction) => {
		// add order to firebase
		const cart = await fillOrderProducts(orderProducts)
		const newOrder: CompletedOrder = {
			products: cart,
			orderPrice: priceInfo,
			completed: false,
			dateTS: Timestamp.now(),

			name: customerInfo.fullName,
			payment_source: customerInfo.paymentSource,
			address: customerInfo.address,
			paypalOrderID: paypalToken,
		}
		const newOrderDoc = db.collection("orders").doc()
		transaction.create(newOrderDoc, newOrder)
	
		await Promise.allSettled(cart.map(async p => {
			const updateDoc = (await db.collection("products").doc(p.PID).get()).data() as FirebaseProduct
			const updateVariant = updateDoc.variants.find(v => v.sku === p.variantSKU)
			if (!updateVariant) throw "Variant not found"
			updateVariant.quantity -= p.quantity
			await db.collection("products").doc(p.PID).update({
				variants: [...updateDoc.variants.filter(v => v.sku !== p.variantSKU), updateVariant]
			})
		}))
		
		return newOrderDoc.id;
	})

	return id
}

const submitPayPalOrder = async (token: string): Promise<PayPalAuthorizePaymentSuccess> => {
	// authorize payment
	const options = { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await generateAccessToken()}` }, };
	const authResponse = await fetch(`${PAYPALDOMAIN}/v2/checkout/orders/${token}/authorize`, options);
	const data = await authResponse.json();
	if (!authResponse.ok) throw data;
	return data;
};

async function submitOrderHandler(req: Request): Promise<submitOrderRes> {
	// INPUT VALIDATION
	const { token } = attemptSubmitOrderProps(await req.json())
	// make sure order is well formed before authorizing the payment
	const { products: orderProducts, orderPrice: priceInfo, PayPalCustomer: customerInfo, status } = await getPayPalOrder(token)

	if (!(status === "COMPLETED" || status === "APPROVED")) throw "Order is not Approved"

	attemptCustomer(customerInfo) // validates p1 completion
	attemptPrice(priceInfo) // this validates that p0 has been completed
	const finalCustomerInfo = customerInfo as Customer
	const finalPriceInfo = priceInfo as Price

	if (status === "COMPLETED") {
		const existingOrderRef = await db.collection("orders").where("paypalOrderID", "==", token).count().get()
		if (existingOrderRef.data().count != 0) throw "Order could not be found in our databases"
	}

	// populate cart (fossilize the cart in case products change/are removed)
	// also validate that all the products are still valid one last time
	const firebaseOrderID = await firebaseLogOrder(orderProducts, finalPriceInfo, finalCustomerInfo, token)
	if (status === "APPROVED") await submitPayPalOrder(token)
	// TODO update firebase to show that payment has gone through (by attaching paypal token??)
	return { firebaseOrderID }
}

export const dynamic = 'force-dynamic'
export const POST = (req: Request) => apiHandler(req, submitOrderHandler)