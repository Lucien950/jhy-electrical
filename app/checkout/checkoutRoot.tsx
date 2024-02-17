"use client"
// react/next
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
// ui
import { AnimatePresence } from 'framer-motion'
// types
import { OrderProduct } from 'types/order'
import { FormCustomer, Customer } from 'types/customer'
import { FormPrice } from 'types/price'
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
import { toast } from 'react-toastify'
import { isEqual } from 'lodash'
import { updateOrderAddress } from "app/checkout/paypalClient";

// STAGE TECHNOLOGY
const useStage = (initialStage: number, customerInfo: FormCustomer) => {
	const [stage, setStage] = useState(initialStage)
	const [p0CusUpdated, setP0CusUpdated] = useState(false)
	const [p1CusUpdated, setP1CusUpdated] = useState(false)

	useEffect(() => setP0CusUpdated(customerInfo !== null && validateP0FormData(customerInfo.fullName, customerInfo.address)),
	[customerInfo?.address, customerInfo?.fullName]) //eslint-disable-line react-hooks/exhaustive-deps
	useEffect(() => setP1CusUpdated(customerInfo !== null && validateP1FormData(customerInfo.paymentMethod, customerInfo.payment_source)),
	[customerInfo?.paymentMethod, customerInfo?.payment_source]) //eslint-disable-line react-hooks/exhaustive-deps
	const goToStage = (s: number) => (() => { logEvent(analytics(), "checkout_progress", { checkout_step: s }); setStage(s) })
	return { stage, goToStage, p0CusUpdated, p1CusUpdated }
}

type CheckoutProps = {
	CheckoutPayPalCustomer: Partial<FormCustomer>,
	CheckoutPayPalPrice: FormPrice,
	CheckoutOrderProducts: OrderProduct[],
	CheckoutOrderID: string,
	initialStage: number
}
export default function CheckoutRoot({
	CheckoutPayPalCustomer: init_CheckoutPayPalCustomer, CheckoutPayPalPrice: init_CheckoutPayPalPrice,
	CheckoutOrderProducts: init_CheckoutOrderProducts, CheckoutOrderID, initialStage
}: CheckoutProps) {
	useEffect(() => {
		if (!init_CheckoutOrderProducts) return //just for types
		logEvent(analytics(), "begin_checkout"); logEvent(analytics(), "checkout_progress", { checkout_step: initialStage });
		// update displayed cart
		fillOrderProducts(init_CheckoutOrderProducts).then(newCart => setCheckoutOrderCart(newCart))
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	// IMPORTANT GLOBAL STATE
	const [checkoutPayPalCustomer, setCheckoutPayPalCustomer] = useState<FormCustomer>(init_CheckoutPayPalCustomer)
	const [checkoutPayPalPrice, setCheckoutPayPalPrice] = useState<FormPrice>(init_CheckoutPayPalPrice)
	const [checkoutOrderCart, setCheckoutOrderCart] = useState<OrderProduct[] | null>(null)

	// P0/P1 done indicate when customerInfo state has been updated (MAKE SURE ONLY AFTER API CALLS HAVE BEEN MADE)
	const { stage, goToStage, p0CusUpdated, p1CusUpdated } = useStage(initialStage, checkoutPayPalCustomer)

	// Variables for PriceComponent
	const [calculatingShipping, setCalculatingShipping] = useState(false)
	const proceedP0ToP1 = async (p0Done: boolean, fullName: FormCustomer["fullName"], address: FormCustomer["address"]) => {
		// this is fine because `!p0Done` already implies there is an error
		if (!p0Done) return toast.error(validateP0FormError(fullName, address)?.message || "Three catches failed, undefined error", { theme: "colored" })
		if (!address || !fullName) return //just for type narrowing, form validation already should catch this
		
		//recalculating shipping
		if (fullName == checkoutPayPalCustomer.fullName && isEqual(address, checkoutPayPalCustomer.address)) return goToStage(1)
		setCalculatingShipping(true)
		try {
			const { newPrice } = await updateOrderAddress(CheckoutOrderID, address, fullName)
			setCheckoutPayPalCustomer(ci => ({ ...ci, fullName, address }))
			setCheckoutPayPalPrice(newPrice)
			goToStage(1)
		}
		catch (e) {
			console.error(e)
			toast.error("Update Product Server Side Error: check console for more details", { theme: "colored" }) 
		}
		finally { setCalculatingShipping(false) }
	}

	const CheckoutStageView = () => {
		if (checkoutPayPalCustomer === null || checkoutPayPalPrice === null || stage === null) return <></>
		if (stage == 0)
			return (
				<CheckoutStageZero
					formSubmit={proceedP0ToP1}
					validateP0FormData={validateP0FormData}
					checkoutPayPalCustomer={checkoutPayPalCustomer}
					checkoutOrderCart={checkoutOrderCart}
					calculatingShipping={calculatingShipping}
				/>
			)
		else if (stage == 1)
			return (
				<CheckoutStageOne
					addP1CustomerInfo={(paymentMethod: Customer["paymentMethod"], payment_source: Customer["payment_source"]) => setCheckoutPayPalCustomer(ci => ({ ...ci, paymentMethod, payment_source }))}
					customerInfo={checkoutPayPalCustomer}
					CheckoutOrderID={CheckoutOrderID}
					goToStage={goToStage}
				/>
			)
		else if (stage == 2)
			return (
				<CheckoutStageTwo
					checkoutPayPalCustomer={checkoutPayPalCustomer}
					checkoutPayPalPrice={checkoutPayPalPrice}
					checkoutOrderCart={checkoutOrderCart}
					CheckoutOrderID={CheckoutOrderID}
					goToStage={goToStage}
				/>
			)
		throw new Error("Current checkout stage is not a valid value")
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