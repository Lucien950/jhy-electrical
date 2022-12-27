import db from "../../../util/firebase/firestore"
import { getDoc, doc, setDoc } from "firebase/firestore"
import { GetServerSideProps } from "next"
import { firestoreOrder } from "../../../types/order"
import { getPaymentIntent } from "../../../util/stripeSever"
export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { pid, payment_intent, payment_intent_client_secret, redirect_status } = ctx.query
	
	// cart
	const cartRef = doc(db, "orders", pid as string)
	const cartDoc = await getDoc(cartRef)
	const cart = cartDoc.data() as firestoreOrder

	// redirect check
	if (redirect_status != "succeeded"){
		await setDoc(cartRef, {...cart, failureReason: `Redirect Status not Succeeded, is ${redirect_status}`})
		return { redirect: { permanent: false, destination: `/order/${pid}/failed`} }
	}
	
	// calculate the prices
	const { amount } = await getPaymentIntent(payment_intent as string)
	const cartPrice = cart.orderPrice
	if (amount != cartPrice){
		await setDoc(cartRef, {...cart, failureReason: `Stripe Payment Amount (${amount}) not equal Firebase Product Amount (${cartPrice})`})
		return { redirect: { permanent: false, destination: `/order/${pid}/failed` } }
	}

	const updateStatus = await setDoc(cartRef, { ...cart , status:"complete"})

	return {
		redirect: {
			permanent: false,
			destination: `/order/${pid}?first=true`,
		}
	}
}

const Complete = () => {
	return <></>
};
export default Complete