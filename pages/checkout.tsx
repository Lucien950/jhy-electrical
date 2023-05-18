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
import { PriceInterface, validateFinalPrice } from "types/price"
import { getProductByID } from 'util/productUtil'
import { updateOrderAddress } from 'util/paypal/client/updateOrderClient'
import { validatePostalCode } from 'util/shipping/postalCode'
import { validateAddress, validateAddressError } from 'types/paypal'
import {isEqual as objectIsEqual} from "lodash"
// analytics
import { logEvent } from 'firebase/analytics'
import { analytics } from 'util/firebase/analytics'



const findAddressFound = (ci: CustomerInterface) => validateAddress(ci.address)
const findPaymentMethodFound = (ci: CustomerInterface) => (ci.paymentMethod == "paypal" && !!ci.payment_source?.paypal) || (ci.paymentMethod == "card" && !!ci.payment_source?.card)
const findFinalPriceCalculated = (pi: PriceInterface) => validateFinalPrice(pi)

type CheckoutProps = {
	paypalCustomerInformation: CustomerInterface,
	paypal_error?: string,
	productIDs: OrderProduct[],
	paypalPaymentInformation: PriceInterface,
	orderID: string,
	redirect_link: string,
	initialCheckoutStage: number
}
export default function Checkout({ paypalCustomerInformation, paypalPaymentInformation, productIDs, paypal_error, orderID, redirect_link, initialCheckoutStage }: CheckoutProps) {
	// customer
	const [customerInformation, setCustomerInformation] = useState<CustomerInterface>({
		paymentMethod: null, address: { country_code: "CA" },
		...paypalCustomerInformation
	})
	// pricing
	const [paymentInformation, setPaymentInformation] = useState<PriceInterface>(paypalPaymentInformation)
	// pricing UI
	const [calculatingShipping, setCalculatingShipping] = useState(false)
	const [finalPriceCalculated, setFinalPriceCalculated] = useState(false)
	const [addressFound, setAddressFound] = useState(false)
	const [paymentMethodFound, setPaymentMethodFound] = useState(false)
	const [addressChanges, setAddressChanges] = useState(-1) //will go to 0 onload
	useEffect(()=>{
		setAddressChanges(ac=>ac+1)
		setAddressFound(findAddressFound(customerInformation))
		setPaymentMethodFound(findPaymentMethodFound(customerInformation))
		setFinalPriceCalculated(findFinalPriceCalculated(paymentInformation))
	}, [customerInformation.address])

	//recalculate only when navigating away from shipping screen
	//recalculate on load if shipping is not found
	const uo = async () => {
		// due dilligence
		if (!validatePostalCode(customerInformation.address?.postal_code)) return
		console.log("recalculating");
		setCalculatingShipping(true)
		try {
			//eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const { newPrice } = await updateOrderAddress(orderID, customerInformation.address!, customerInformation.fullName!)
			setPaymentInformation(newPrice)
		}
		catch (e) {
			toast.error((e as Error).message, { theme: "colored" })
		}
		finally {
			setCalculatingShipping(false)
		}
	}
	const [cart, setCart] = useState<OrderProduct[]>()
	useEffect(() => {
		logEvent(analytics(), "begin_checkout");
		logEvent(analytics(), "checkout_progress", { checkout_step: initialCheckoutStage })

		// update shipping (if paypal express checkout and no shipping)
		if (addressFound && !paymentInformation.shipping) uo();
		// update displayed cart
		Promise.all(productIDs.map(async p => ({ ...p, product: await getProductByID(p.PID) })))
			.then(newCart => setCart(newCart))
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	// CHECKOUT STAGES
	const [currentCheckoutStage, setCurrentCheckoutStage] = useState(initialCheckoutStage)
	const canGoToPayment = addressFound || finalPriceCalculated
	const canGoToReview = finalPriceCalculated && paymentMethodFound
	const canGoToStage = [true, canGoToPayment, canGoToReview]
	const goToStage = (stage: number) => (async () => {
		if (canGoToStage[stage]) {
			if (currentCheckoutStage == 0) {
				if (addressChanges > 0) await uo()
				setAddressChanges(0)
			}
			setCurrentCheckoutStage(stage)
			logEvent(analytics(), "checkout_progress", { checkout_step: stage })
		}
	})

	const CheckoutStageView = () => {
		if (currentCheckoutStage == 0) {
			const p1 = {
				customerInformation, setCustomerInformation, cart,
				canGoToPayment, nextCheckoutStage: goToStage(1)
			}
			return <CheckoutStageZero {...p1} />
		}
		else if (currentCheckoutStage == 1) {
			const setPaymentMethod = (newPaymentMethod: "paypal" | "card") => setCustomerInformation(ci => ({ ...ci, paymentMethod: newPaymentMethod }))
			const p2 = {
				prevCheckoutStage: goToStage(0), nextCheckoutStage: goToStage(2),
				customerInformation,
				redirect_link,
				setPaymentMethod
			}
			return <CheckoutStageOne {...p2} />
		}
		else if (currentCheckoutStage == 2) {
			const p3 = {
				customerInformation, paymentInformation,
				cart, orderID,
				goToShipping: goToStage(0), goToPayment: goToStage(1)
			}
			return <CheckoutStageTwo {...p3} />
		}
		else throw new Error("Current checkout stage is not a valid value")
	}

	// rendering conditions
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
							{/* shipping */} <button className="text-black hover:underline" onClick={goToStage(0)}>Shipping</button>
							{/* arrow */} <svg className="h-4 w-4 stroke-black" fill="none" stroke="currentColor" strokeWidth={6} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" /> </svg>
							{/* payment */} <button className={`transition-colors ${canGoToPayment && "text-black hover:underline"}`} onClick={goToStage(1)} disabled={!canGoToPayment}>Payment</button>
							{/* arrow */} <svg className={`transition-colors h-4 w-4 ${canGoToPayment && "stroke-black"}`} fill="none" stroke="currentColor" strokeWidth={6} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" /> </svg>
							{/* review */} <button className={`transition-colors ${canGoToReview && "text-black hover:underline"}`} onClick={goToStage(2)} disabled={!canGoToReview}>Review</button>
						</div>
					</div>

					{/* CONTENT */}
					<div className="flex flex-row gap-x-4 relative align-top">
						{/* left side (forms and review area) */}
						<div className="flex-[2]"> <AnimatePresence mode="wait" > {CheckoutStageView()} </AnimatePresence> </div>

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
	if (!token) return { redirect: { destination: "/cart", permanent: true } }

	// coming back from paypal ordering
	try {
		const {
			customerInformation: paypalCustomerInformation, paymentInformation: paypalPaymentInformation,
			products: productIDs, redirect_link, status} = await getOrder(token)
		
		if(status == "COMPLETED") return { props: { paypal_error: "Order has already been completed" } }

		const ret = { paypalCustomerInformation, paypalPaymentInformation, productIDs, orderID: token, } as CheckoutProps
		if (redirect_link) ret.redirect_link = redirect_link

		// determining initial checkout stage
		const addressFound = findAddressFound(paypalCustomerInformation)
		const paymentMethodFound = findPaymentMethodFound(paypalCustomerInformation)
		if (addressFound && !paymentMethodFound) ret.initialCheckoutStage = 1
		else if (paymentMethodFound) ret.initialCheckoutStage = 2
		else ret.initialCheckoutStage = 0

		return { props: ret }
	}
	catch (e) { return { props: { paypal_error: e } as CheckoutProps } }
}