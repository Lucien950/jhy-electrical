import { GetServerSideProps } from "next";
import Link from "next/link";
import Head from "next/head";

import { doc, getDoc } from "firebase/firestore";
import { db } from "util/firebase/firestore"

import { FirestoreOrderInterface, OrderInterface } from "types/order";
import { getProductByID } from "util/productUtil";
import Price from "components/price";
import seedRandom from "seedrandom";
import { CardElement } from "components/cardElement";

const BACKGROUNDCOUNT = 3
const Order = ({ order }: { order: OrderInterface }) => {
	if (!order) {
		return (
			<div className="grid place-items-center text-5xl h-screen">
				Order not found
			</div>
		)
	}
	order.date = new Date(order.date)

	const backgroundID = Math.floor(seedRandom(order.firebaseOrderID)() * BACKGROUNDCOUNT) + 1
	const backgroundFilters = [
		{ brightness: 0.7, contrast: 0.9, saturation: 1.4 },
		{ brightness: 0.6, contrast: 0.85, saturation: 1 },
		{ brightness: 0.8, contrast: 0.85, saturation: 1 },
	]

	return (
		<>
			<Head>
				<title>Order for {order.name}, on {order.date.toLocaleDateString()} | JHY Electrical</title>
			</Head>
			<div className="h-screen w-screen" >
				{/* background */}
				<img src={`/orderBackgrounds/order_${backgroundID}.webp`} alt="" className="w-full h-full object-cover fixed -z-40"
					style={{ filter: `brightness(${backgroundFilters[backgroundID - 1].brightness}) contrast(${backgroundFilters[backgroundID - 1].contrast}) saturate(${backgroundFilters[backgroundID - 1].saturation})` }} />
				<div className="container mx-auto flex flex-row gap-x-10 pt-20 min-h-screen relative">
					{/* left side */}
					<div className="flex-[5] text-white flex flex-col gap-y-4 sticky top-[10rem] self-start">
						{/* head */}
						<h1 className="font-bold text-4xl flex flex-row items-center gap-x-2">
							<svg className="w-9 h-9" fill="#48f542" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
							Thank you for your order
						</h1>
						{/* order is confirmed */}
						<div
							style={{ background: "linear-gradient(92.38deg, rgba(243, 254, 255, 0.08) 5.44%, rgba(0, 0, 0, 0.02) 83.26%)", }}
							className="backdrop-blur-md p-5 border-2 rounded-xl border-white border-opacity-20 text-opacity-[0.9] text-white"
						>
							<h2 className="mb-3 text-3xl font-bold">Your order <Link href="#" className="link bg-white bg-opacity-70 p-2 rounded-md">#{order.firebaseOrderID.slice(0, 8)}</Link> is confirmed</h2>
							<p>Please keep the link as a reference for your purchase</p>
							<p>Order Timestamp: {order.date.toLocaleDateString()} at {order.date.toLocaleTimeString()}</p>
						</div>
						{/* customer information */}
						<div
							style={{
								background: "linear-gradient(92.38deg, rgba(243, 254, 255, 0.15) 5.44%, rgba(0, 0, 0, 0.10) 83.26%)",
							}}
							className="backdrop-blur-md p-5 border-2 rounded-lg border-white border-opacity-20"
						>
							<h1 className="font-bold text-3xl mb-4">
								Customer Information
							</h1>
							<div className="flex flex-col gap-y-6">
								<div>
									<h2 className="text-xl mb-1 font-bold">Payer Information</h2>
									{
										order.payment_source.card &&
										<div>
											<CardElement cardInformation={order.payment_source.card} seed={order.firebaseOrderID} />
										</div>
									}
									<p>{order.name}</p>
									<p>PayPal Order ID: {order.paypalOrderID}</p>
									{
										order.payment_source.paypal &&
										<div>
											<a href={`mailto:${order.payment_source.paypal.email_address}`}>
												<p className="break-all">PayPal Email: {order.payment_source.paypal.email_address}</p>
											</a>
										</div>
									}
								</div>
								<div>
									<h2 className="text-xl mb-1 font-bold">Shipping Address</h2>
									<p>{order.address.address_line_1}</p>
									<p>{order.address.address_line_2}</p>
									<p>{order.address.admin_area_2}, {order.address.admin_area_1}, {order.address.country_code}</p>
									<p>{order.address.postal_code}</p>
								</div>
							</div>
						</div>
						<Link href="/products" className="self-end">
							<button className=" bg-blue-400 p-4 text-2xl rounded-lg text-white">
								<p>Continue Shopping</p>
							</button>
						</Link>
					</div>
					{/* right side */}
					<div className="flex-[6] bg-white p-4 rounded-md shadow-md">
						<h1 className="text-4xl font-bold p-6">Order Summary</h1>
						<hr />
						<div className="flex flex-col gap-y-6 p-6">
							{
								order.products.map(productInfo => {
									const { product } = productInfo
									if (!product) return (<div></div>)
									return (
										<div key={productInfo.PID} className="flex flex-row items-center gap-x-5 justify-start">
											<div className="relative">
												<img src={product.productImageURL} className="h-24 w-24 object-cover" alt="" />
												<span className="absolute top-0 right-0 translate-x-[50%] translate-y-[-50%] w-10 h-10 bg-blue-500 overflow-hidden rounded-full leading-none grid place-items-center text-white text-xl font-bold">{productInfo.quantity}</span>
											</div>
											<Link href={`/products/${productInfo.PID}`}>
												<p className="text-xl">{product.productName}</p>
											</Link>
											<p className="ml-auto"><Price price={product.price} />/ea</p>
										</div>
									)
								})
							}
						</div>
						<hr />
						<div className="p-6 grid grid-cols-2 text-xl gap-y-2">
							<p>Subtotal</p>
							<p className="justify-self-end">{order.orderPrice.subtotal.toFixed(2)}</p>
							<p>Shipping</p>
							<p className="justify-self-end">{order.orderPrice.shipping.toFixed(2)}</p>
							<p>Tax</p>
							<p className="justify-self-end">{order.orderPrice.tax.toFixed(2)}</p>
						</div>
						<hr />
						<div className="p-6 text-xl flex flex-row justify-between">
							<p>Total:</p>
							<p><Price price={order.orderPrice.total} /></p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { pid } = ctx.query
	if (!pid || typeof pid != "string") {
		return {
			redirect: {
				destination: "/",
				permanent: false
			}
		}
	}
	const orderDoc = await getDoc(doc(db, "orders", pid))
	const firestoreOrder = orderDoc.data() as FirestoreOrderInterface
	if (!firestoreOrder) {
		return {
			props: {}
		}
	}
	const order = { ...firestoreOrder, firebaseOrderID: orderDoc.id, date: firestoreOrder.dateTS.toDate() } as OrderInterface

	order.products = await Promise.all(order.products.map(async productInfo => {
		productInfo.product = await getProductByID(productInfo.PID)
		return productInfo
	}))

	return {
		props: {
			order: JSON.parse(JSON.stringify(order))
		}
	}
}

export default Order