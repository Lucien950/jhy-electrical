"use client"
// react/next
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
// ui
import { AnimatePresence } from 'framer-motion'
// types
import { OrderProduct } from 'types/order'
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
//utils
import { fillOrderProducts } from 'util/order'
import { validateP0FormData, validateP0FormError, validateP1FormData } from './validateStage'
import Price from './price'

// STAGE TECHNOLOGY
const useStage = (initialStage: number, customerInfo: CustomerInterface) => {
	const [stage, setStage] = useState(initialStage)
	const [p0CusUpdated, setP0CusUpdated] = useState(false)
	const [p1CusUpdated, setP1CusUpdated] = useState(false)

	useEffect(() => setP0CusUpdated(customerInfo !== null && validateP0FormData(customerInfo.fullName, customerInfo.address)),
	[customerInfo?.address, customerInfo?.fullName]) //eslint-disable-line react-hooks/exhaustive-deps
	useEffect(() => setP1CusUpdated(customerInfo !== null && validateP1FormData(customerInfo.paymentMethod, customerInfo.payment_source)),
	[customerInfo?.paymentMethod, customerInfo?.payment_source]) //eslint-disable-line react-hooks/exhaustive-deps

	return { stage, setStage, p0CusUpdated, p1CusUpdated }
}

type CheckoutProps = {
	CheckoutPayPalCustomer: Partial<CustomerInterface>,
	CheckoutPayPalPrice: PriceInterface,
	CheckoutOrderProducts: OrderProduct[],
	CheckoutOrderID: string,
	initialStage: number
}
export default function CheckoutRoot({
	CheckoutPayPalCustomer: init_CheckoutPayPalCustomer, CheckoutPayPalPrice: init_CheckoutPayPalPrice,
	CheckoutOrderProducts: init_CheckoutOrderProducts, CheckoutOrderID, initialStage
}: CheckoutProps) {
	// IMPORTANT GLOBAL STATE
	const [checkoutPayPalCustomer, setCheckoutPayPalCustomer] = useState<CustomerInterface>(init_CheckoutPayPalCustomer)
	const [checkoutPayPalPrice, setCheckoutPayPalPrice] = useState<PriceInterface>(init_CheckoutPayPalPrice)
	const [checkoutOrderCart, setCheckoutOrderCart] = useState<OrderProduct[] | null>(null)

	// P0/P1 done indicate when customerInfo state has been updated (MAKE SURE ONLY AFTER API CALLS HAVE BEEN MADE)
	const { stage, setStage, p0CusUpdated, p1CusUpdated } = useStage(initialStage, checkoutPayPalCustomer)
	const goToStage = (s: number) => (() => { logEvent(analytics(), "checkout_progress", { checkout_step: s }); setStage(s) })

	const CheckoutStageView = () => {
		if (checkoutPayPalCustomer === null || checkoutPayPalPrice === null || stage === null) return <></>
		if (stage == 0)
			return (
				<CheckoutStageZero
					setStage={setStage}
					addP0CustomerInfo={(fullName: string, address: Address) => setCheckoutPayPalCustomer(ci => ({ ...ci, fullName, address }))}
					setPriceInfo={setCheckoutPayPalPrice}
					validateP0Form={validateP0FormData}
					validateP0FormError={validateP0FormError}
					setCalculatingShipping={setCalculatingShipping}
					CheckoutOrderID={CheckoutOrderID}
					customerInfo={checkoutPayPalCustomer}
					orderCart={checkoutOrderCart}
					calculatingShipping={calculatingShipping}
				/>
			)
		else if (stage == 1)
			return (
				<CheckoutStageOne
					customerInfo={checkoutPayPalCustomer}
					addP1CustomerInfo={(paymentMethod: FinalCustomerInterface["paymentMethod"], payment_source: FinalCustomerInterface["payment_source"]) => setCheckoutPayPalCustomer(ci => ({ ...ci, paymentMethod, payment_source }))}
					setStage={setStage}
					orderID={CheckoutOrderID}
				/>
			)
		else if (stage == 2)
			return (
				<CheckoutStageTwo
					customerInfo={checkoutPayPalCustomer}
					price={checkoutPayPalPrice}
					checkoutOrderCart={checkoutOrderCart}
					setStage={setStage}
					CheckoutOrderID={CheckoutOrderID}
				/>
			)
		throw new Error("Current checkout stage is not a valid value")
	}
	
	// Variables for PriceComponent
	const [calculatingShipping, setCalculatingShipping] = useState(false)

	useEffect(() => {
		if (!init_CheckoutOrderProducts) return //just for types
		logEvent(analytics(), "begin_checkout");
		logEvent(analytics(), "checkout_progress", { checkout_step: initialStage })
		// update displayed cart

		fillOrderProducts(init_CheckoutOrderProducts).then(newCart => setCheckoutOrderCart(newCart))
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
						<div className="flex-[2]">
							<AnimatePresence mode="wait" >
								{CheckoutStageView()}
							</AnimatePresence>
						</div>
						<div className="sticky top-[1rem] flex-[1] self-start p-6 bg-black text-white">
							<Price checkoutPayPalPrice={checkoutPayPalPrice} calculatingShipping={calculatingShipping}/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}