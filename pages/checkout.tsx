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
import { toast } from 'react-toastify';
// api
import getorder from './api/paypal/getorder';
// types
import CustomerInterface from 'types/customer';
import { OrderProduct } from 'types/order';
import { removePersistCustomer } from 'util/redux/persistCustomer.slice';
// checkout stages
import CheckoutStageZero from "components/checkout/p0"
import CheckoutStageOne from "components/checkout/p1"
import CheckoutStageTwo from "components/checkout/p2"
// util
import { displayVariants } from 'util/formVariants';
// analytics
import { logEvent } from 'firebase/analytics';
import { analytics } from 'util/firebase/analytics';
import { createPayPalOrderLink } from 'util/paypal/createOrder';
import { PriceInterface } from 'util/priceUtil';


type CheckoutProps = { paypalCustomerInformation?: CustomerInterface, paypal_error?: Error }
export default function Checkout({ paypalCustomerInformation, paypal_error }: CheckoutProps){
	const router = useRouter()
	const dispatch = useDispatch()
	
	// cart
	const cart = useSelector((state: { cart: OrderProduct[] }) => state.cart)
	const [checkoutCart, setCheckoutCart] = useState<OrderProduct[]>([])
	const [updatedCart, setUpdatedCart] = useState(false)
	// customer
	const persistCustomer = useSelector((state: { persistCustomer: CustomerInterface }) => state.persistCustomer)
	const [customerInformation, setCustomerInformation] = useState<CustomerInterface>({
		first_name: "",
		last_name: "",
		paymentMethod:"",
		address: {
			country_code: "CA",			
		}
	})
	// pricing
	const [paymentInformation, setPaymentInformation] = useState<PriceInterface>({ subtotal: 0, tax: 0, shipping: 0, total: 0 })
	const [redirectLink, setRedirectLink] = useState<string>("")
	const [calculatingPI, setCalculatingPI] = useState(false)
	const finalTotalFound = Object.values(paymentInformation).every(i => i != 0)
	const paymentMethodFound =
		(customerInformation.paymentMethod == "paypal" && !!customerInformation.paypalInfo) ||
		(customerInformation.paymentMethod == "card" && !!customerInformation.cardInfo)

	// CHECKOUT STAGES
	const [currentCheckoutStage, setCurrentCheckoutStage] = useState(0)	
	const canGoToPayment = finalTotalFound
	const canGoToReview = finalTotalFound && paymentMethodFound
	// CHECKOUT STAGES
	const goToShipping = () => {
		setCurrentCheckoutStage(0)
		logEvent(analytics(), "checkout_progress", { checkout_step: 0 })
	}
	const goToPayment = () => {
		if (canGoToPayment) {
			setCurrentCheckoutStage(1)
			logEvent(analytics(), "checkout_progress", { checkout_step: 1 })
		}
	}
	const goToReview = () => {
		if (canGoToReview) {
			setCurrentCheckoutStage(2)
			logEvent(analytics(), "checkout_progress", { checkout_step: 2 })
		}
	}
	const GetCheckoutStageView = () => {
		switch (currentCheckoutStage) {
			case 0:
				return 	<CheckoutStageZero
									customerInformation={customerInformation}
									cart={cart}
									canGoToPayment={canGoToPayment}
									paymentInformation={paymentInformation}
									nextCheckoutStage={goToPayment}

									shippingUpdate={(id: string, val: string) => {
										setCustomerInformation(ci => ({
											...ci,
											address: {
												...customerInformation.address,
												[id]: val
											}
										}))
									}}
									customerUpdate={(id: string, val: string) => {
										setCustomerInformation(ci=>({
											...ci,
											[id]: val
										}))
									}}
								/>
			case 1:
				return  <CheckoutStageOne
									prevCheckoutStage={goToShipping}
									nextCheckoutStage={goToReview}
									customerInformation={customerInformation}
									redirect_link={redirectLink}
									setPaymentMethod={(newPaymentMethod: "paypal" | "card") => {
										setCustomerInformation({ ...customerInformation, paymentMethod: newPaymentMethod })
									}}
									removePayPal={() => {
										const { paypalInfo, ...newCI } = customerInformation
										setCustomerInformation(newCI)
									}}
								/>
			case 2:
				return  <CheckoutStageTwo
									customerInformation={customerInformation}
									paymentInformation={paymentInformation}
									cart={cart}
									goToShipping={goToShipping}
									goToPayment={goToPayment}
								/>
		}
	}

	// ONLOAD
	useEffect(() => {
		if (paypal_error) {
			console.error("PAYPAL ERROR", paypal_error)
			toast(`Paypal Error: ${paypal_error.message}`)
			return
		}
		// only use persist customer if coming from paypal
		if (paypalCustomerInformation) {
			setCustomerInformation({ ...paypalCustomerInformation, ...persistCustomer })
			dispatch(removePersistCustomer())
			setCurrentCheckoutStage(2) // force go to review (because state takes too long 😭)
			logEvent(analytics(), "checkout_paypal_express")
			logEvent(analytics(), "checkout_progress", { checkout_step: 2 })
			return
		}
		
		logEvent(analytics(), "begin_checkout")
	}, [])
	useEffect(() => {
		if (updatedCart) return
		if (cart.length == 0) {
			router.push("/products")
			return
		}
		(async () => {
			setCalculatingPI(true)
			// token=44S86873MC079910N & PayerID=CEPBDHWUALZTA
			const { orderID, paymentInformation: pi, redirect_link } = await createPayPalOrderLink(cart)
			// create paypal object
			router.push({
				pathname: '/checkout',
				query: { token: orderID },
			}, undefined, { shallow: true })

			setRedirectLink(redirect_link)
			setCheckoutCart(cart)
			setPaymentInformation(pi)
			setUpdatedCart(true)
			setCalculatingPI(false)
		})()
	}, [cart])
	useEffect(()=>{
		
	},[checkoutCart])

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
							{/* Subtotal */}
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
							{/* Shipping */}
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
										calculatingPI
										? <PriceComponent price={paymentInformation.shipping} className="place-self-end" />
										: <Oval height={20} width={20} strokeWidth={7} color="white" secondaryColor="white" />
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
								<PriceComponent price={paymentInformation.tax} className="place-self-end" />
							</motion.div>
							{/* Total */}
							<motion.div className="flex flex-row mb-8" variants={displayVariants} initial="hidden" animate="visible" exit="hidden" key="paymentTotal">
								<p className="flex-1">Total</p>
								<PriceComponent price={paymentInformation.total} className="place-self-end" />
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
	if (!token) return { props: {} }
	else{
		// coming back from paypal ordering
		let error_message;
		const paypalCustomerInformation = await getorder(token).catch((err: { error_message: string }) => error_message = err)

		if (!paypalCustomerInformation) return { props: { paypal_error: error_message } }
		return { props: { paypalCustomerInformation } as CheckoutProps }
	}
}