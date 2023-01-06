// react and next
import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from 'util/redux/cart.slice';
// ui
import { CircleLoader } from 'react-spinners';
import { AnimatePresence, motion } from 'framer-motion';
// firestore products
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import db from "util/firebase/firestore"
import { firestoreOrder, productInfo } from 'types/order';
// paypal
import { CreateOrderData, CreateOrderActions, OnApproveData, OnApproveActions, OnCancelledActions } from "@paypal/paypal-js"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const CheckoutForm = ()=>{
	const [orderTotal, setOrderTotal] = useState(-1)
	
	const [shipping, setShipping] = useState(-1)
	const [postalCode, setPostalCode] = useState("")
	const [shippingCostLoading, setShippingCostLoading] = useState(false)

	const postalCodeInput = useRef(null)
	const router = useRouter()
	const dispatch = useDispatch()
	const cart = useSelector((state: { cart: productInfo[] }) => state.cart) as productInfo[]

	useEffect(()=>{
		if(cart.length == 0){
			router.push("/products")
		}
		const total = cart.reduce((acc, p) => acc + (p.product?.price || 0) * p.quantity, 0)
		setOrderTotal(total)

		// shipping
		if (postalCode){
			setShippingCostLoading(true)
			fetch("/api/shippingcost", {
				method: "POST",
				body:JSON.stringify({
					products: cart.map(productInfo=>{
						const {width, height, length, weight} = productInfo.product!
						return { width, height, length, weight, quantity: productInfo.quantity }
					}),
					// TODO origin and destination?
					origin: "K2J6E4",
					destination: postalCode
				})
			})
			.then(res => {
				if (!res.ok) throw res!.json()
				return res!.json()
			})
			.then(res => {
				setShipping(res)
				setShippingCostLoading(false)
			})
			.catch(e => {
				e.then((eres: any)=>{
					console.error("Canada Post API Error: ", eres.originalMessages[0].description)
					setShippingCostLoading(false)
				})
			})
		}
	}, [cart, postalCode])

	const estimateShipping: MouseEventHandler<HTMLButtonElement> = (e)=>{
		e.preventDefault()
		if (!postalCodeInput.current) return
		const inputField = postalCodeInput.current as HTMLInputElement
		const valid = !!inputField.value.match(/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i)
		if(valid) setPostalCode(inputField.value.toUpperCase())
		else{
			// TODO Display error
			console.error("Postal Code Not Valid")
		}
	}

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
		const orderInfo = await actions.order!.capture()
		console.log("approve order", data, orderInfo)
		const doc = await addDoc(collection(db, "orders"), {
			orderPrice: orderTotal,
			dateTS: Timestamp.now(),
			products: cart.map(({PID, quantity}) => {return{PID, quantity}}),
			orderID: data.orderID,
			name:orderInfo.purchase_units[0].shipping?.name?.full_name,
			email:orderInfo.payer.email_address,
			phone:"",
			address: orderInfo.purchase_units[0].shipping?.address,
			paypalOrderID: data.orderID
		} as firestoreOrder)
		router.push(`/order/${doc.id}`)
		dispatch(clearCart())
	}
	const cancelOrder: (data: Record<string, unknown>, actions: OnCancelledActions) => void = (data, actions)=>{
		console.log("cancel order", data)
	}

	return(
		<form className="flex flex-row container mx-auto gap-x-4 relative align-top">
			<div className="flex-[3_3_75%]">
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
					<h1 className="font-bold text-3xl mb-2 mt-6">2 Estimate Shipping</h1>
					<div className="flex flex-row gap-x-2">
						<input type="text" ref={postalCodeInput} className="p-2 border-2 rounded-md block focus:outline-none focus:ring-2" placeholder='Postal Code'/>
						<button
							onClick={estimateShipping}
							className="border-2 rounded-md p-2 block overflow-hidden transition-[width] relative"
							disabled={shippingCostLoading}
						>
							<AnimatePresence>
								{
									shippingCostLoading ? 
									<motion.div
										initial={{ opacity: 0, y:50, x: "-50%" }}
										animate={{ opacity: 1, y:0, x: "-50%" }}
										exit={{ opacity: 0, y: -50, x: "-50%" }}
										transition={{duration: 0.1, ease: 'easeInOut'}}
										key="a"
										className="absolute left-[50%]"
									>
										<CircleLoader size={20}/>
									</motion.div>
									:
									<motion.div
										initial={{ opacity: 0, y: 50, x: "-50%" }}
										animate={{ opacity: 1, y: 0, x: "-50%" }}
										exit={{ opacity: 0, y: -50, x: "-50%" }}
										transition={{duration: 0.1, ease: 'easeInOut'}}
										key="b"
										className="absolute left-[50%]"
									>
										Estimate
									</motion.div>
								}
							</AnimatePresence>
							{/* prop open the button */}
							<div className="invisible">Estimate</div>
						</button>
					</div>
				</div>
				<div>
					<h1 className="font-bold text-3xl mb-2 mt-6">3 Complete Payment</h1>
					<PayPalScriptProvider options={{
						"client-id": "AXYy21o5ltoZFx3P1iOMBrpfPbWYcumU-qKzFK_7nQBk_H_8PSQNaNVJGwLOOBVwvv-C6cp4o2p0eJQT",
						components: "buttons",
						currency: "CAD"
					}}>
						{
							shipping != -1 ? 
							<PayPalButtons
								className="w-full flex justify-center"
								style={{ layout: "vertical", color:"black", label:"checkout"}}
								fundingSource={undefined}
								forceReRender={[orderTotal]}
								createOrder={createOrder}
								onApprove={approveOrder}
								onCancel={cancelOrder}
							/>
							:
							<div className="flex justify-center border-2 rounded-md p-4 bg-gray-100 text-gray-400 border-gray-200">
								<span>
									Please complete previous steps for shipping price before paying.
								</span>
							</div>
						}
					</PayPalScriptProvider>
				</div>
			</div>
			<div className="sticky top-[1rem] flex-[1_1_25%] h-min">
				<h1 className="text-2xl font-bold mt-6">Order Summary</h1>
				<p>Subtotal: ${orderTotal != -1 ? orderTotal.toFixed(2) : <CircleLoader />}</p>
				<p>Shipping: ${shipping != -1 ? shipping : "_"}</p>
				<p>Tax Rate: ${(orderTotal * 0.13).toFixed(2)}</p>
				<p>Total: ${shipping != -1 && orderTotal != -1 ? (orderTotal * 1.13 + shipping).toFixed(2) : "_"}</p>
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