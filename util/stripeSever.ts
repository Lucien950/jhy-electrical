import Stripe from "stripe"
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SK as string, { apiVersion: '2022-11-15' });
export const createPaymentIntent = async (amount: number)=>{
	const paymentIntent = await stripe.paymentIntents.create({
		amount,
		currency: 'cad',
		payment_method_types: ['card', 'alipay', 'wechat_pay'],
	})
	return paymentIntent
}
export const getPaymentIntent = async(client_secret: string)=>{
	const paymentIntent = await stripe.paymentIntents.retrieve(client_secret)
	return paymentIntent
}