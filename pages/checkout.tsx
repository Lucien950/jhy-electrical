// react/next
import { GetServerSideProps } from 'next'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
// ui
import { AnimatePresence } from 'framer-motion'
import PriceComponent from 'components/price'
import { Oval } from 'react-loader-spinner'
import Tippy from '@tippyjs/react'
// util
import { getOrder } from 'server/paypal/getOrderFetch'
import { validateAddress, validateAddressError } from 'types/address'
// types
import { OrderProduct, OrderProductFilled } from 'types/order'
import { validateName, CustomerInterface, validateNameError, FinalCustomerInterface } from 'types/customer'
import { PriceInterface } from 'types/price'
// analytics
import { logEvent } from 'firebase/analytics'
import { analytics } from 'util/firebase/analytics'
// stages
import CheckoutStageZero from "components/checkout/p0"
import CheckoutStageOne from "components/checkout/p1"
import CheckoutStageTwo from "components/checkout/p2"


/**
 * @returns Stage 1.1 Verify that the name and address are valid
 * @param ci Customer object
 */
const validateP0FormData = (name: CustomerInterface["fullName"], address: CustomerInterface["address"]) => validateP0FormError(name, address) === null
const validateP0FormError = (name: CustomerInterface["fullName"], address: CustomerInterface["address"]) => {
	if (!validateName(name)) {return validateNameError(name)}
	if (!validateAddress(address)) {return validateAddressError(address)}
	return null
}
/**
 * @returns Stage 1.2 Price has been updated (from the address)
 * @param pi payment object
 */
// const findFinalPriceCalculated = (pi: PriceInterface) => validateFinalPrice(pi)
/**
 * @returns Stage 2.1 If payment has been approved
 * @param ci customer object
 */
const validateP1FormData = (paymentMethod: CustomerInterface["paymentMethod"], PaymentSource: CustomerInterface["payment_source"]) => (paymentMethod == "paypal" && !!PaymentSource?.paypal) || (paymentMethod == "card" && !!PaymentSource?.card)

// STAGE TECHNOLOGY
const useStage = (initialStage: number, customerInfo: CustomerInterface)=>{
	const [stage, setStage] = useState(initialStage)
	const [p0CusUpdated, setP0CusUpdated] = useState(false)
	const [p1CusUpdated, setP1CusUpdated] = useState(false)

	useEffect(() => setP0CusUpdated(customerInfo !== null && validateP0FormData(customerInfo.fullName, customerInfo.address)), 						 [customerInfo?.address, 			customerInfo?.fullName]) //eslint-disable-line react-hooks/exhaustive-deps
	useEffect(() => setP1CusUpdated(customerInfo !== null && validateP1FormData(customerInfo.paymentMethod, customerInfo.payment_source)), [customerInfo?.paymentMethod, customerInfo?.payment_source]) //eslint-disable-line react-hooks/exhaustive-deps

	return {stage, setStage, p0CusUpdated, p1CusUpdated}
}

type ErrorCheckoutProps = {
	paypal_error?: string,
}
type CheckoutProps = {
	paypalCustomerInfo: CustomerInterface,
	paypalPriceInfo: PriceInterface,
	emptyOrderProducts: OrderProduct[],
	orderID: string,
	initialStage: number
}
export default function Checkout({ paypalCustomerInfo: paypalCustomerInformation, paypalPriceInfo: paypalPaymentInformation, emptyOrderProducts, paypal_error, orderID, initialStage }: CheckoutProps & ErrorCheckoutProps){
	// IMPORTANT GLOBAL STATE
	const [customerInfo, setCustomerInfo] = useState<CustomerInterface>(paypalCustomerInformation)
	const addP0CustomerInfo = (fullName: string, address: Address) => setCustomerInfo(ci => ({ ...ci, fullName, address }))
	const addP1CustomerInfo =  (paymentMethod: FinalCustomerInterface["paymentMethod"], payment_source: FinalCustomerInterface["payment_source"]) => setCustomerInfo(ci => ({ ...ci, paymentMethod, payment_source }))
	const [priceInfo, setPriceInfo] = useState<PriceInterface>(paypalPaymentInformation)
	const [orderCart, setOrderCart] = useState<OrderProductFilled[] | null>(null)

	// P0/P1 done indicate when customerInfo state has been updated (MAKE SURE ONLY AFTER API CALLS HAVE BEEN MADE)
	const {stage, setStage, p0CusUpdated, p1CusUpdated} = useStage(initialStage, customerInfo)
	const goToStage = (s: number) => (() => { logEvent(analytics(), "checkout_progress", { checkout_step: s }); setStage(s) })

	const CheckoutStageView = () => {
		if ( customerInfo === null || priceInfo === null || stage === null) return <></>
		if (stage == 0)
			return (
				<CheckoutStageZero
				{...{ 
						setStage,
						addP0CustomerInfo,
						setPriceInfo,
						customerInfo,
						validateP0Form: validateP0FormData,
						validateP0FormError,
						orderID,
						orderCart,
						calculatingShipping,
						setCalculatingShipping
					}}
				/>
			)
		else if (stage == 1)
			return <CheckoutStageOne {...{
				customerInfo,
				addP1CustomerInfo,
				setStage,
				orderID
			}}/>
		else if (stage == 2)
			return <CheckoutStageTwo {...{
				customerInfo,
				priceInfo,
				orderCart,
				setStage,
				orderID
			}}/>
		throw new Error("Current checkout stage is not a valid value")
	}

	// Variables for NavComponent

	// Variables for PriceComponent
	const [calculatingShipping, setCalculatingShipping] = useState(false)

	useEffect(() => {
		if (paypal_error) { logEvent(analytics(), "checkout_error_paypal_SSR"); return }
		if (!emptyOrderProducts) return //just for types
		logEvent(analytics(), "begin_checkout");
		logEvent(analytics(), "checkout_progress", { checkout_step: initialStage })
		// update displayed cart

		fillOrderProducts(emptyOrderProducts).then(newCart => setOrderCart(newCart))
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	// rendering conditions
	if (paypal_error) { //type checking 
		return (
			<div className="w-full h-screen grid place-items-center">
				<div>
					<h1>Paypal Error</h1>
					<p>{paypal_error}</p>
					<Link href="/cart"> <button className="underline">Go Back</button> </Link>
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
						<div className="flex flex-row items-center self-end text-xl gap-x-5">
							{/* shipping */}<button className="text-black hover:underline disabled:hover:no-underline transition-colors disabled:text-gray-300" onClick={goToStage(0)} disabled={!true}>Shipping</button>
							{/* arrow */}   <svg className="h-4 w-4 stroke-black fill-none transition-colors data-[disabled=true]:stroke-gray-300" strokeWidth={6} data-disabled={!true} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" /></svg>

							{/* payment */} <button className="text-black hover:underline disabled:hover:no-underline transition-colors disabled:text-gray-300" onClick={goToStage(1)} disabled={!p0CusUpdated}>Payment</button>
							{/* arrow */}   <svg className="h-4 w-4 stroke-black fill-none transition-colors data-[disabled=true]:stroke-gray-300" strokeWidth={6} data-disabled={!p0CusUpdated} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" /></svg>

							{/* review */}  <button className="text-black hover:underline disabled:hover:no-underline transition-colors disabled:text-gray-300" onClick={goToStage(2)} disabled={!(p0CusUpdated && p1CusUpdated)} >Review</button>
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
							{/* Subtotal */}
							<div className="flex flex-row mb-4 justify-between">
								<span> Subtotal </span>
								<div>
									<PriceComponent price={priceInfo.subtotal} />
								</div>
							</div>
							{/* Shipping */}
							<div className="flex flex-row mb-4 justify-between">
								<div className="flex flex-row items-center gap-x-2">
									<span> Shipping </span>
									<Tippy content={"Shipping cost is calculated using the Canada Post rate."} delay={50}>
										<svg className="h-5 w-5 focus:outline-none focus:stroke-blue-300 hover:cursor-pointer" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
											<path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
										</svg>
									</Tippy>
								</div>
								{
									calculatingShipping
										? <Oval height={20} width={20} strokeWidth={7} color="white" secondaryColor="white" />
										: <PriceComponent price={priceInfo.shipping} />
								}
							</div>
							{/* Tax */}
							<div className="flex flex-row justify-between mb-4">
								<div className="flex flex-row items-center gap-x-2">
									<span> Tax </span>
									<Tippy content={"Tax is calculated based on the Ontario rate of 13%"} delay={50}>
										<svg className="h-5 w-5 focus:outline-none focus:stroke-blue-300 hover:cursor-pointer" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
											<path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
										</svg>
									</Tippy>
								</div>
								<PriceComponent price={priceInfo.tax} />
							</div>
							{/* Total */}
							<div className="flex flex-row justify-between mb-8">
								<p>Total</p>
								<PriceComponent price={priceInfo.total} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

import { updateOrderAddress } from 'server/paypal/updateOrderFetch'
import { fillOrderProducts } from 'util/orderUtil'
import { Address } from '@paypal/paypal-js'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const token = ctx.query.token as string
	if (!token) return { redirect: { destination: "/cart", permanent: true } }
	const EMPTYRET = {
		paypalCustomerInfo: {} as CustomerInterface,
		paypalPriceInfo: {} as PriceInterface,
		emptyOrderProducts: [],
		initialStage: 0,
		orderID: token
	}

	// coming back from paypal ordering
	try {
		const {
			customerInfo: paypalCustomerInfo,
			priceInfo,
			products: emptyOrderProducts, status
		} = await getOrder(token)
		let paypalPriceInfo = priceInfo;

		if (status == "COMPLETED") return { props: { paypal_error: "Order has already been completed", ...EMPTYRET } as CheckoutProps }

		// base address
		if (!paypalCustomerInfo.address) paypalCustomerInfo.address = { country_code: "CA" }

		const p0Done = validateP0FormData(paypalCustomerInfo.fullName, paypalCustomerInfo.address)
		const p1Done = validateP1FormData(paypalCustomerInfo.paymentMethod, paypalCustomerInfo.payment_source)
		// paymentInfo shipping update
		if (p0Done && !paypalPriceInfo.shipping) {
			const newPrice = await updateOrderAddress(token, paypalCustomerInfo.address!, paypalCustomerInfo.fullName!) //eslint-disable-line @typescript-eslint/no-non-null-assertion 
			paypalPriceInfo = newPrice
		}
		// determining initial checkout stage
		let initialStage: number;
		if (p0Done && p1Done) initialStage = 2
		else if (p0Done && !p1Done) initialStage = 1
		else initialStage = 0

		return { props: { paypalCustomerInfo, paypalPriceInfo, emptyOrderProducts, orderID: token, initialStage } as CheckoutProps }
	}
	catch (e) { return { props: { paypal_error: JSON.stringify(e, Object.getOwnPropertyNames(e)), ...EMPTYRET } as CheckoutProps } }
}