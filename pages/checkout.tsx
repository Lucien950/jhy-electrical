// react and next
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
// redux
import { useDispatch, useSelector } from 'react-redux';
// ui
import { AnimatePresence, motion } from 'framer-motion';
import { Oval } from 'react-loader-spinner';
import Tippy from '@tippyjs/react';	
import PriceComponent from 'components/price';
// api
import getorder from './api/paypal/getorder';
import { calculateShipping } from 'util/calculateShipping';

// types
import CustomerInterface from 'types/customer';
import { Price, productInfo } from 'types/order';

import { removePersistCustomer } from 'util/redux/persistCustomer.slice';

// checkout stages
import CheckoutStageZero from "components/checkout/p0"
import CheckoutStageOne from "components/checkout/p1"
import CheckoutStageTwo from "components/checkout/p2"

import { postalCodePattern } from 'util/postalCodePattern';
import { displayVariants } from 'util/formVariants';

import { logEvent } from 'firebase/analytics';
import { analytics } from 'util/firebase/analytics';

const TAX_RATE = 0.13

const NoPriceComponent = ()=>{
	return (
		<p> - </p>
	)
}

type CheckoutProps = { paypalCustomerInformation?: CustomerInterface, paypal_error?: Error }
export default function Checkout({ paypalCustomerInformation, paypal_error }: CheckoutProps){
	const router = useRouter()
	const dispatch = useDispatch()
	
	// CHECKOUT DATA
	const cart = useSelector((state: { cart: productInfo[] }) => state.cart) as productInfo[]
	const [paymentInformation, setPaymentInformation] = useState({ subtotal: 0, shipping: 0, tax: 0, total: 0, } as Price)
	const persistCustomer = useSelector((state: { persistCustomer: CustomerInterface }) => state.persistCustomer) as CustomerInterface
	const [customerInformation, setCustomerInformation] = useState({ paymentMethod:"", address:{admin_area_1: "", postal_code: ""}} as CustomerInterface)
	// CHECKOUT STAGES
	const [currentCheckoutStage, setCurrentCheckoutStage] = useState(0)
	const [finalTotalFound, setFinalTotalFound] = useState(false)
	const canGoToPayment = finalTotalFound
	const [paymentMethodFound, setPaymentMethodFound] = useState(false)
	const canGoToReview = finalTotalFound && paymentMethodFound
	// UI STATES
	const [calculatingShipping, setCalculatingShipping] = useState(false)
	const [submitOrderLoading, setSubmitOrderLoading] = useState(false)

	// ONLOAD
	useEffect(() => {
		if (paypal_error) {
			// TODO display this error
			console.error("PAYPAL ERROR", paypal_error)
			return
		}

		logEvent(analytics(), "begin_checkout")
		// only use persist customer if coming from paypal
		if (!paypalCustomerInformation) {
			dispatch(removePersistCustomer())
			return
		}
		else{
			setCustomerInformation({ ...paypalCustomerInformation, ...persistCustomer })
			dispatch(removePersistCustomer())
		}


		setFinalTotalFound(true)
		setPaymentMethodFound(true)
		setCurrentCheckoutStage(2) // force go to review (because state takes too long 😭)
		logEvent(analytics(), "checkout_paypal_express")
		logEvent(analytics(), "checkout_progress", { checkout_step: 2 })
		router.push("/checkout", undefined, { shallow: true }) //remove paypal redirect information from URL
	}, [])

	// CHECKOUT STAGES
	const goToShipping = ()=>{
		setCurrentCheckoutStage(0)
		logEvent(analytics(), "checkout_progress", { checkout_step: 0})
	}
	const goToPayment = () => {
		if (canGoToPayment) {
			setCurrentCheckoutStage(1)
			logEvent(analytics(), "checkout_progress", { checkout_step: 1})
		}
	}
	const goToReview = () => {
		if (!canGoToReview){
			setCurrentCheckoutStage(2)
			logEvent(analytics(), "checkout_progress", { checkout_step: 2})
		}
	}
	useEffect(()=>{
		setPaymentMethodFound(
			(customerInformation.paymentMethod == "paypal" && !!customerInformation.paypalInfo) ||
			(customerInformation.paymentMethod == "card" && !!customerInformation.cardInfo)
		)
	}, [customerInformation.paymentMethod, customerInformation.paypalInfo, customerInformation.cardInfo])
	const GetCheckoutStageView = () => {
		switch (currentCheckoutStage) {
			case 0:
				return <CheckoutStageZero
					customerInformation={customerInformation}
					setCustomerInformation={setCustomerInformation}
					cart={cart}
					canGoToPayment={canGoToPayment}
					paymentInformation={paymentInformation}
					nextCheckoutStage={goToPayment}
				/>
			case 1:
				return <CheckoutStageOne
					goToShipping={goToShipping}
					goToReview={goToReview}
					customerInformation={customerInformation}
					total={paymentInformation.total}
					setPaymentMethod={(newPaymentMethod: "paypal" | "card") => {
						setCustomerInformation({ ...customerInformation, paymentMethod: newPaymentMethod })
					}}
					removePayPal={(e) => {
						const { paypalInfo, ...newCI } = customerInformation
						setCustomerInformation(newCI)
					}}
				/>
			case 2:
				return <CheckoutStageTwo
					customerInformation={customerInformation}
					paymentInformation={paymentInformation}
					setSubmitOrderLoading={setSubmitOrderLoading}
					submitOrderLoading={submitOrderLoading}
					cart={cart}
					goToShipping={goToShipping}
					goToPayment={goToPayment}
				/>
		}
	}

	// PRICE CALCULATIONS
	// set shipping
	useEffect(() => {
		if (!customerInformation.address.postal_code?.match(new RegExp(postalCodePattern))) {
			setFinalTotalFound(false)
			return;
		}
		
		setCalculatingShipping(true)
		calculateShipping(cart, customerInformation.address.postal_code)
		.then(costs => {
			logEvent(analytics(), "add_shipping_info")
			setPaymentInformation({
				...paymentInformation,
				shipping: cart.reduce((a, p) => a + costs[p.PID] * p.quantity || 0, 0)
			})
			setFinalTotalFound(true)
			setCalculatingShipping(false)
		})
		.catch(e=>{
			// TODO display error
			logEvent(analytics(), "shipping_info_calculation_error")
			console.error(e)
			setCalculatingShipping(false)
		})
	}, [customerInformation.address.postal_code, cart])
	// set subtotal (prices)
	useEffect(() => {
		if (cart.length == 0) {
			router.push("/products")
			return
		}
		setPaymentInformation({
			...paymentInformation,
			subtotal: cart.reduce((acc, p) => acc + (p.product?.price || 0) * p.quantity, 0),
		})
	}, [cart])
	// set tax
	useEffect(() => {
		if (!paymentInformation.subtotal) return
		setPaymentInformation({
			...paymentInformation,
			tax: (paymentInformation.subtotal + paymentInformation.shipping) * TAX_RATE
		})
	}, [paymentInformation.subtotal, paymentInformation.shipping])
	// set total from order and shipping
	useEffect(() => {
		if(!paymentInformation.subtotal || !paymentInformation.shipping || !paymentInformation.tax) return
		setPaymentInformation({
			...paymentInformation,
			total: paymentInformation.subtotal + paymentInformation.shipping + paymentInformation.tax
		})
	}, [paymentInformation.subtotal, paymentInformation.shipping, paymentInformation.tax])

	return ( 
	<>
		<Head>
			<title>Checkout | JHY Electrical</title>
		</Head>
		<div className="w-full min-h-screen bg-zinc-200">
			<div className="max-w-6xl mx-auto py-8 px-10 bg-white min-h-screen shadow-lg">
				{/* TOP ROW */}
				<div className="flex flex-row justify-between mb-6">
					{/* Logo */} <Link href="/"> <img src="/logo.svg" className="h-20" alt="" /> </Link>
					<div className="flex flex-row items-center self-end text-xl gap-x-5 text-gray-300 stroke-gray-300 transition-colors">
						{/* shipping */} <button className="text-black hover:underline" onClick={goToShipping}>Shipping</button>
						{/* arrow */} <svg className="h-4 w-4 stroke-black" fill="none" stroke="currentColor" strokeWidth={6} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" /> </svg>
						{/* payment */} <button className={`transition-colors ${canGoToPayment && "text-black hover:underline"}`} onClick={goToPayment} disabled={!canGoToPayment}>Payment</button>
						{/* arrow */} <svg className={`transition-colors h-4 w-4 ${canGoToPayment && "stroke-black"}`} fill="none" stroke="currentColor" strokeWidth={6} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" /> </svg>
						{/* review */} <button className={`transition-colors ${canGoToReview && "text-black hover:underline"}`} onClick={goToReview} disabled={!canGoToReview}>Review</button>
					</div>
				</div>

				{/* CONTENT */}
				<div className="flex flex-row gap-x-4 relative align-top">
					{/* left side (forms and review area) */}
					<div className="flex-[2]"> <AnimatePresence mode="wait" > {GetCheckoutStageView()} </AnimatePresence> </div>

					{/* right side (numbers, black box area)*/}
					<div className="sticky top-[1rem] flex-[1] self-start p-6 bg-black text-white">
						<h1 className="text-3xl font-bold">Order Summary</h1>
						<hr className="my-4" />
						{/* Render Numbers */}
						<AnimatePresence>
							<div className="flex flex-row mb-4" key="subtotal">
								<p className="flex-1"> Subtotal </p>
								<div>
									{
									paymentInformation.subtotal
									?  <PriceComponent price={paymentInformation.subtotal} className="place-self-end" />
									: <Oval height={20} width={20} strokeWidth={7} color="white" secondaryColor="white"/>
									}
								</div>
							</div>
							<motion.div className="flex flex-row mb-4" variants={displayVariants} initial="hidden" animate="visible" exit="hidden" key="shipping">
								<p className="flex flex-row items-center gap-x-2 flex-1">
									<span> Shipping </span>
									<Tippy content={"Shipping cost is calculated using the Canada Post rate."} delay={50}>
										<svg className="h-5 w-5 focus:outline-none hover:cursor-pointer" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
											<path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
										</svg>
									</Tippy>
								</p>
								{
									finalTotalFound
									? <PriceComponent price={paymentInformation.shipping} className="place-self-end" />
									:
									(calculatingShipping
									? <Oval height={20} width={20} strokeWidth={7} color="white" secondaryColor="white"/>
									: <NoPriceComponent />)
								}
							</motion.div>
							{/* Tax */}
							<motion.div className="flex flex-row mb-4" variants={displayVariants} initial="hidden" animate="visible" exit="hidden" key="tax">
								<p className="flex flex-row items-center gap-x-2 flex-1">
									Tax
									<Tippy content={"Tax is calculated based on the Ontario rate of 13%"} delay={50}>
										<svg className="h-5 w-5 focus:outline-none hover:cursor-pointer" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
											<path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
										</svg>
									</Tippy>
								</p>
								{
									finalTotalFound
									? <PriceComponent price={paymentInformation.tax} className="place-self-end" />
									: <NoPriceComponent />
								}
							</motion.div>
							{/* Total */}
							<motion.div className="flex flex-row mb-8" variants={displayVariants} initial="hidden" animate="visible" exit="hidden" key="paymentTotal">
								<p className="flex-1">Total</p>
								{
									finalTotalFound
									? <PriceComponent price={paymentInformation.total} className="place-self-end" />
									: <NoPriceComponent />
								}
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	</>
	);
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const token = ctx.query.token as string
	if (!token) return{ props:{} }
	
	let error;
	const paypalCustomerInformation = await getorder(token).catch(err=>{ error = err })

	if(!paypalCustomerInformation) return{ props:{ paypal_error: error } }
	return { props: { paypalCustomerInformation } }
}