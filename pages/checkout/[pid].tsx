import { createPaymentIntent } from '../../util/stripeSever';
import stripePromise from '../../util/stripeClient';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { PaymentIntent } from '@stripe/stripe-js';

import { GetServerSideProps } from 'next';
import { FormEvent, useEffect, useState } from 'react';

import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import db from "../../util/firebase/firestore"
import { firestoreOrder, order } from '../../types/order';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getProductsByIDs } from '../../util/fillProduct';
import { CircleLoader } from 'react-spinners';

const CheckoutForm = ({ orderID, setPaying }: { orderID: string, setPaying: (val: boolean)=>void})=>{
	const stripe = useStripe()
	const elements = useElements()
	const [loadingProducts, setLoadingProducts] = useState(true)
	const [order, setOrder] = useState({} as order)
	
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!stripe || !elements) return

		setPaying(true)
		const result = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/order/${orderID}/complete`,
			},
		})

		if (result.error) {
			console.log(result.error.message);
		}
	};


	useEffect(() => {
		getDoc(doc(db, "orders", orderID)).then(orderDoc => orderDoc.data() as order)
			.then(async (order) => {
				const productList = order.products
				return { order, res: await getProductsByIDs(productList.map(p => p.PID)) }
			})
			.then(({ order, res }) => {
				order.products = order.products.map(productInfo => {
					productInfo.product = res.find(p => p.firestoreID == productInfo.PID)
					return productInfo
				})
				setLoadingProducts(false)
				setOrder(order)
			})
	}, [])

	return(
		<form className="grid grid-cols-4 mx-24" onSubmit={handleSubmit}>
			<div className="col-span-3">
				<div>
					<h1 className="font-bold text-3xl mb-2 mt-6">1 Payment Method</h1>
					<PaymentElement />
				</div>
				<div>
					<h1 className="font-bold text-3xl mb-2 mt-6">2 Review Items</h1>
					<div>
						{
							loadingProducts?
							<CircleLoader />
							:
							order.products.map(productInfo=>
								<div className="flex flex-row items-center gap-x-2 bg-gray-200 rounded-lg p-2" key={productInfo.PID}>
									<img src={productInfo.product?.productImageURL} alt="" className="h-10"/>
									<p>
										{productInfo.product?.productName}
									</p>
									<p>
										{productInfo.product?.price}
									</p>
								</div>
							)
						}
					</div>
				</div>
			</div>
			<div>
				<button type="submit" className="p-2 border-2 w-full">Place Order</button>
				<hr />
				<h1>Order Summary</h1>
				<p>Order Total: </p>
			</div>
		</form>
	)
}

const Checkout = ({ paymentIntent, orderID }: { paymentIntent: PaymentIntent, orderID: string }) => {
	const router = useRouter()
	let paying = false
	const setPaying = ()=>{paying = true}
	
	
	const deleteOrder = ()=>{
		deleteDoc(doc(db, "orders", orderID))
	}

	useEffect(() => {
		const handleWindowClose = (e: BeforeUnloadEvent) => {
			// e.preventDefault()
			// TODO CLEAN UP PENDING ORDERS
			// if(paying) return
			// deleteOrder()
			// return
		}
		const handleBrowseAway = () => {
			console.log("handle browse away")
			if(paying) return
			if (window.confirm("Are you sure you want to cancel the checkout?")){
				deleteOrder()
				return
			}
			router.events.emit('routeChangeError')
			throw 'routeChange aborted.'
		};
	
		window.addEventListener('beforeunload', handleWindowClose);
		router.events.on('routeChangeStart', handleBrowseAway);
		
		// UNSUB
		return () => {
			window.removeEventListener('beforeunload', handleWindowClose);
			router.events.off('routeChangeStart', handleBrowseAway);
		};
	}, []);


	return (
		<>
		<Head>
			<title>Checkout | JHY Electrical</title>
		</Head>
		<div>
			<div className="flex flex-row p-2">
				<Link href="/">
				<img src="/logo.svg" className="h-20" alt="" />
				</Link>
			</div>
			<Elements stripe={stripePromise} options={{ clientSecret: paymentIntent.client_secret!, }}>
			<CheckoutForm orderID={orderID} setPaying={setPaying}/>
			</Elements>
		</div>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const orderDoc = await getDoc(doc(db, "orders", ctx.query.pid as string))
	const { orderPrice } = orderDoc.data() as firestoreOrder
	const paymentIntent = await createPaymentIntent(orderPrice)
	return{
		props:{
			paymentIntent,
			orderID: orderDoc.id
		}
	}
}

export default Checkout;