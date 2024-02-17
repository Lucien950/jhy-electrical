"use client"
// react/next
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
// ui
import { AnimatePresence } from 'framer-motion'
import PriceComponent from 'components/price'
import { Oval } from 'react-loader-spinner'
import Tippy from '@tippyjs/react'
// types
import { OrderProduct, OrderProductFilled } from 'types/order'
import { CustomerInterface, FinalCustomerInterface } from 'types/customer'
import { Address } from 'types/address'
import { PriceInterface } from 'types/price'
// analytics
import { logEvent } from 'firebase/analytics'
import { analytics } from 'util/firebase/analytics'
// stages
import CheckoutStageZero from "./p0"
import CheckoutStageOne from "./p1"
import CheckoutStageTwo from "./p2"

import { fillOrderProducts } from 'util/order/orderUtil'
import { validateP0FormData, validateP0FormError, validateP1FormData } from './validateStage'

// STAGE TECHNOLOGY
const useStage = (initialStage: number, customerInfo: CustomerInterface) => {
	const [stage, setStage] = useState(initialStage)
	const [p0CusUpdated, setP0CusUpdated] = useState(false)
	const [p1CusUpdated, setP1CusUpdated] = useState(false)

	useEffect(() => setP0CusUpdated(customerInfo !== null && validateP0FormData(customerInfo.fullName, customerInfo.address)), [customerInfo?.address, customerInfo?.fullName]) //eslint-disable-line react-hooks/exhaustive-deps
	useEffect(() => setP1CusUpdated(customerInfo !== null && validateP1FormData(customerInfo.paymentMethod, customerInfo.payment_source)), [customerInfo?.paymentMethod, customerInfo?.payment_source]) //eslint-disable-line react-hooks/exhaustive-deps

	return { stage, setStage, p0CusUpdated, p1CusUpdated }
}

type CheckoutProps = {
	paypalCustomerInfo: Partial<CustomerInterface>,
	paypalPriceInfo: PriceInterface,
	emptyOrderProducts: OrderProduct[],
	orderID: string,
	initialStage: number
}
export default function CheckoutRoot({ paypalCustomerInfo: paypalCustomerInformation, paypalPriceInfo: paypalPaymentInformation, emptyOrderProducts, orderID, initialStage }: CheckoutProps) {
	// IMPORTANT GLOBAL STATE
	const [customerInfo, setCustomerInfo] = useState<CustomerInterface>(paypalCustomerInformation)
	const addP0CustomerInfo = (fullName: string, address: Address) => setCustomerInfo(ci => ({ ...ci, fullName, address }))
	const addP1CustomerInfo = (paymentMethod: FinalCustomerInterface["paymentMethod"], payment_source: FinalCustomerInterface["payment_source"]) => setCustomerInfo(ci => ({ ...ci, paymentMethod, payment_source }))
	const [priceInfo, setPriceInfo] = useState<PriceInterface>(paypalPaymentInformation)
	const [orderCart, setOrderCart] = useState<OrderProductFilled[] | null>(null)

	// P0/P1 done indicate when customerInfo state has been updated (MAKE SURE ONLY AFTER API CALLS HAVE BEEN MADE)
	const { stage, setStage, p0CusUpdated, p1CusUpdated } = useStage(initialStage, customerInfo)
	const goToStage = (s: number) => (() => { logEvent(analytics(), "checkout_progress", { checkout_step: s }); setStage(s) })

	const CheckoutStageView = () => {
		if (customerInfo === null || priceInfo === null || stage === null) return <></>
		if (stage == 0)
			return (
				<CheckoutStageZero
					setStage={setStage}
					addP0CustomerInfo={addP0CustomerInfo}
					setPriceInfo={setPriceInfo}
					customerInfo={customerInfo}
					validateP0Form={validateP0FormData}
					validateP0FormError={validateP0FormError}
					orderID={orderID}
					orderCart={orderCart}
					calculatingShipping={calculatingShipping}
					setCalculatingShipping={setCalculatingShipping}
				/>
			)
		else if (stage == 1)
			return <CheckoutStageOne {...{
				customerInfo,
				addP1CustomerInfo,
				setStage,
				orderID
			}} />
		else if (stage == 2)
			return <CheckoutStageTwo {...{
				customerInfo,
				priceInfo,
				orderCart,
				setStage,
				orderID
			}} />
		throw new Error("Current checkout stage is not a valid value")
	}

	// Variables for NavComponent

	// Variables for PriceComponent
	const [calculatingShipping, setCalculatingShipping] = useState(false)

	useEffect(() => {
		if (!emptyOrderProducts) return //just for types
		logEvent(analytics(), "begin_checkout");
		logEvent(analytics(), "checkout_progress", { checkout_step: initialStage })
		// update displayed cart

		fillOrderProducts(emptyOrderProducts).then(newCart => setOrderCart(newCart))
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

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