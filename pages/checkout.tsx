import { useEffect, useState } from 'react';
import { firestoreOrder, productInfo } from '../types/order';
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { CreateOrderData, CreateOrderActions, OnApproveData, OnApproveActions, OnCancelledActions } from "@paypal/paypal-js"
import { CircleLoader } from 'react-spinners';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import db from "../util/firebase/firestore"
import { useRouter } from 'next/router';
import { clearCart } from '../util/redux/cart.slice';

const CheckoutForm = ()=>{
	const [orderTotal, setOrderTotal] = useState(-1)
	const router = useRouter()
	const dispatch = useDispatch()
	const cart = useSelector((state: { cart: productInfo[] }) => state.cart) as productInfo[]

	useEffect(()=>{
		const total = cart.reduce((acc, p) => acc + (p.product?.price || 0) * p.quantity, 0)
		setOrderTotal(total)
	}, [cart])

	const createOrder: (data: CreateOrderData, actions: CreateOrderActions) => Promise<string> = async (data, actions)=>{
		console.log("create order", data)
		return actions.order.create({
			purchase_units: [
				{
					amount: {
						currency_code: "CAD",
						value: orderTotal.toString(),
						breakdown:{}
					},
				},
			],
		});
	}
	const approveOrder: (data: OnApproveData, actions: OnApproveActions) => Promise<void> = async (data, actions)=>{
		console.log("approve order", data)
		const doc = await addDoc(collection(db, "orders"), {
			orderPrice: orderTotal,
			dateTS: Timestamp.now(),
			products: cart.map(({PID, quantity}) => {return{PID, quantity}}),
			orderID: data.orderID,
		} as firestoreOrder)
		dispatch(clearCart())
		router.push(`/order/${doc.id}`)
	}
	const cancelOrder: (data: Record<string, unknown>, actions: OnCancelledActions) => void = (data, actions)=>{
		console.log("cancel order", data)
	}

	return(
		<form className="grid grid-cols-4 mx-24 gap-x-4">
			<div className="col-span-3">
				<div>
					<h1 className="font-bold text-3xl mb-2 mt-6">1 Review Items</h1>
					<div className="flex flex-col gap-y-2">
						{cart.map(productInfo=>
						<div className="flex flex-row items-center gap-x-2 bg-gray-200 rounded-lg p-2" key={productInfo.PID}>
							<img src={productInfo.product?.productImageURL} alt="" className="h-10" />
							<p>
								{productInfo.product?.productName}
							</p>
							<p>
								{productInfo.product?.price} x {productInfo.quantity}
							</p>
						</div>
						)}
					</div>
				</div>
				<div>
					<h1 className="font-bold text-3xl mb-2 mt-6">2 Complete Payment</h1>
					<PayPalScriptProvider options={{
						"client-id": "AXYy21o5ltoZFx3P1iOMBrpfPbWYcumU-qKzFK_7nQBk_H_8PSQNaNVJGwLOOBVwvv-C6cp4o2p0eJQT",
						components: "buttons",
						currency: "CAD"
					}}>
						<PayPalButtons
							className="w-full"
							style={{ layout: "vertical" }}
							fundingSource={undefined}
							forceReRender={[orderTotal]}
							createOrder={createOrder}
							onApprove={approveOrder}
							onCancel={cancelOrder}
						/>
					</PayPalScriptProvider>
				</div>
			</div>
			<div>
				<h1 className="text-2xl font-bold mt-6">Order Summary</h1>
				<p>Total: {orderTotal != -1 ? orderTotal : <CircleLoader />}</p>
			</div>
		</form>
	)
}

const Checkout = () => {
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
			<CheckoutForm/>
		</div>
		</>
	);
}

export default Checkout;