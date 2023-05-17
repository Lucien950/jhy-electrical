// react and next
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
// ui
import { AnimatePresence, motion } from 'framer-motion'
import { Oval } from 'react-loader-spinner'
import PriceComponent from 'components/price'
import Tippy from '@tippyjs/react';
import { toast } from 'react-toastify';
import { displayVariants } from 'util/formVariants'
// api
import { getOrder } from 'util/paypal/server/getOrder'
// types
import CustomerInterface from 'types/customer'
import { OrderProduct } from 'types/order'
// checkout stages
import CheckoutStageZero from "components/checkout/p0"
import CheckoutStageOne from "components/checkout/p1"
import CheckoutStageTwo from "components/checkout/p2"
// util
import { PriceInterface } from "types/price"
// analytics
import { logEvent } from 'firebase/analytics'
import { analytics } from 'util/firebase/analytics'
import { getProductByID } from 'util/productUtil'

import { updateOrderAddress } from 'util/paypal/client/updateOrderClient'
import { postalCodePattern } from 'util/shipping/postalCode'

const findFinalTotalFound = (pi: PriceInterface) => Object.values(pi).every(v => v != 0)
const findPaymentMethodFound = (ci: CustomerInterface) => (ci.paymentMethod == "paypal" && !!ci.payment_source?.paypal) || (ci.paymentMethod == "card" && !!ci.payment_source?.card)

type CheckoutProps = {
	paypalCustomerInformation: CustomerInterface,
	paypal_error?: string,
	productIDs: OrderProduct[],
	paypalPaymentInformation: PriceInterface,
	orderID: string,
	redirect_link: string,
	status: string
	initialCheckoutStage: number
}
export default function Checkout({ paypalCustomerInformation, paypalPaymentInformation, productIDs, paypal_error, orderID, redirect_link, status, initialCheckoutStage }: CheckoutProps)
{
	// onload analytics
	const [cart, setCart] = useState<OrderProduct[]>()
	useEffect(() => {
		logEvent(analytics(), "begin_checkout");
		logEvent(analytics(), "checkout_progress", { checkout_step: initialCheckoutStage });
		(async () => {
			const newCart = await Promise.all(productIDs.map(async p => ({ ...p, product: await getProductByID(p.PID) })))
			setCart(newCart)
		})()
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	// customer
	const [customerInformation, setCustomerInformation] = useState<CustomerInterface>({
		fullName: "", paymentMethod: null, address:{ address_line_1: "", address_line_2: "", admin_area_1: "", admin_area_2: "", postal_code: "", country_code: "CA"},
		...paypalCustomerInformation
	})
	// pricing
	const [paymentInformation, setPaymentInformation] = useState<PriceInterface>(paypalPaymentInformation)
	// pricing UI
	const [calculatingShipping, setCalculatingShipping] = useState(false)
	const finalTotalFound = findFinalTotalFound(paymentInformation)
	const paymentMethodFound = findPaymentMethodFound(customerInformation)

	useEffect(()=>{
		// validate admin province is not empty (rest is required in input)
		if (!(currentCheckoutStage == 0)) return
		if (!customerInformation.address?.admin_area_1) return
		if (!customerInformation.address?.postal_code?.match(new RegExp(postalCodePattern))) return

		console.log("recalculating");
		(async ()=>{
			setCalculatingShipping(true)
			// update order with postal code
			try {
				// fine because form validated
				//eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const { newPrice } = await updateOrderAddress(orderID, customerInformation.address!, customerInformation.fullName!) 
				setPaymentInformation(newPrice)
			}
			catch (e) {
				console.error(e)
				toast.error("Error with updating PayPal Address, check console for more information", {
					theme: "colored"
				})
			}
			finally {
				setCalculatingShipping(false)
			}
		})()
	}, [customerInformation]) // eslint-disable-line react-hooks/exhaustive-deps

	// CHECKOUT STAGES
	const [currentCheckoutStage, setCurrentCheckoutStage] = useState(initialCheckoutStage)
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
		if(currentCheckoutStage == 0){
			const p1 = {
				customerInformation, setCustomerInformation,
				cart,
				canGoToPayment, paymentInformation,
				nextCheckoutStage: goToPayment,
			}
			return <CheckoutStageZero {...p1} />
		}
		else if(currentCheckoutStage == 1){
			const setPaymentMethod = (newPaymentMethod: "paypal" | "card") => setCustomerInformation(ci => ({ ...ci, paymentMethod: newPaymentMethod }))
			const p2 = {
				prevCheckoutStage: goToShipping, nextCheckoutStage: goToReview,
				customerInformation,
				redirect_link,
				setPaymentMethod
			}
			return <CheckoutStageOne {...p2} />
		}
		else if(currentCheckoutStage == 2){
			const p3 = { customerInformation, paymentInformation, cart, goToShipping, goToPayment, orderID}
			return <CheckoutStageTwo {...p3} />
		}
		else{
			throw new Error("Current checkout stage is not a valid value")
		}
	}

	if (paypal_error) {
		logEvent(analytics(), "checkout_error_paypal_SSR")
		return (
			<div className="w-full h-screen grid place-items-center">
				<div>
					<h1>Paypal Error</h1>
					<p>{paypal_error}</p>
				</div>
			</div>
		)
	}
	if (status === "COMPLETED") {
		return (
			<div className="w-full h-screen grid place-items-center">
				<div>
					<h1>Paypal Error</h1>
					<p>Order has already been completed</p>
				</div>
			</div>
		)
	}
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
										<PriceComponent price={paymentInformation.subtotal} className="place-self-end" />
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
										calculatingShipping
											? <Oval height={20} width={20} strokeWidth={7} color="white" secondaryColor="white" />
											: <PriceComponent price={paymentInformation.shipping} className="place-self-end" />
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
	if (!token) return {
		redirect: {
			destination: "/cart",
			permanent: true
		}
	}
	// coming back from paypal ordering
	try {
		const {
			customerInformation: paypalCustomerInformation,
			paymentInformation: paypalPaymentInformation,
			products: productIDs,
			redirect_link,
			status
		} = await getOrder(token)
		const ret = {
			paypalCustomerInformation,
			paypalPaymentInformation,
			productIDs,
			orderID: token,
			status
		} as CheckoutProps
		if (redirect_link) ret.redirect_link = redirect_link
		
		// determining initial checkout stage
		const finalTotalFound = findFinalTotalFound(paypalPaymentInformation)
		const paymentMethodFound = findPaymentMethodFound(paypalCustomerInformation)
		if (finalTotalFound && !paymentMethodFound) ret.initialCheckoutStage = 1
		else if (paymentMethodFound) ret.initialCheckoutStage = 2
		else ret.initialCheckoutStage = 0
		
		return { props: ret }
	}
	catch (e) {
		return { props: { paypal_error: e } as CheckoutProps }
	}

}