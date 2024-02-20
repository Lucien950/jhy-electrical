"use client"
// react/next
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { useRouter } from 'next/navigation'
// ui
import { AnimatePresence } from 'framer-motion'
import Price from './price'
// types
import { OrderProduct } from 'types/order'
import { FormCustomer, PaymentMethods } from 'types/customer'
import { FormPrice } from 'types/price'
// analytics
import { logEvent } from 'firebase/analytics'
import { analytics } from 'util/firebase/analytics'
// stages
import CheckoutStageZero from "./p0"; import CheckoutStageOne from "./p1"; import CheckoutStageTwo from "./p2";
//utils
import { toast } from 'react-toastify'
import { isEqual } from 'lodash'
import { approveCard, updateOrderAddress } from "app/checkout/paypalClient";
import { approvePayPal } from "./paypalClient"
import { Stages, useStage } from './stages'
import { FormCard } from 'types/card'

export const metadata: Metadata = {
	title: "Checkout",
	description: "Checkout page for JHY Electrical",
}
export default function CheckoutRoot({
	CheckoutPayPalCustomer: init_CheckoutPayPalCustomer, CheckoutPayPalPrice: init_CheckoutPayPalPrice,
	CheckoutOrderProducts: init_CheckoutOrderProducts, CheckoutOrderID, initialStage
}: {
	CheckoutPayPalCustomer: FormCustomer, CheckoutPayPalPrice: FormPrice,
	CheckoutOrderProducts: OrderProduct[], CheckoutOrderID: string,
	initialStage: Stages
}) {
	const router = useRouter();
	useEffect(() => { logEvent(analytics(), "begin_checkout"); logEvent(analytics(), "checkout_progress", { checkout_step: initialStage }); }, []) // eslint-disable-line react-hooks/exhaustive-deps
	const [checkoutPayPalCustomer, setCheckoutPayPalCustomer] = useState<FormCustomer>(init_CheckoutPayPalCustomer)
	const [checkoutPayPalPrice, setCheckoutPayPalPrice] = useState<FormPrice>(init_CheckoutPayPalPrice)
	const { stage, goToStage, p0DataValid, p1DataValid, setP0DataValid, setP1DataValid } = useStage(initialStage, checkoutPayPalCustomer)
	// UI transition states.
	const [calculatingShipping, setCalculatingShipping] = useState(false)
	const [paymentSubmitLoading, setPaymentApproveLoading] = useState(false)
	return (
		<div className="w-full min-h-screen bg-zinc-200">
			<div className="max-w-6xl mx-auto py-8 px-10 bg-white min-h-screen shadow-lg">
				{/* TOP ROW */}
				<div className="flex flex-row justify-between mb-6">
					{/* Logo */} <Link href="/"> <img src="/logo.svg" className="h-20" alt="" /> </Link>
					<div className="flex flex-row items-center self-end text-xl gap-x-5">
						{/* shipping */}<button className="text-black hover:underline disabled:hover:no-underline transition-colors disabled:text-gray-300" onClick={goToStage(0)} disabled={!true}>Shipping</button>
						{/* arrow */}   <svg className="h-4 w-4 stroke-black fill-none transition-colors data-[disabled=true]:stroke-gray-300" strokeWidth={6} data-disabled={!true} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" /></svg>

						{/* payment */} <button className="text-black hover:underline disabled:hover:no-underline transition-colors disabled:text-gray-300" onClick={goToStage(1)} disabled={!p0DataValid}>Payment</button>
						{/* arrow */}   <svg className="h-4 w-4 stroke-black fill-none transition-colors data-[disabled=true]:stroke-gray-300" strokeWidth={6} data-disabled={!p0DataValid} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" /></svg>

						{/* review */}  <button className="text-black hover:underline disabled:hover:no-underline transition-colors disabled:text-gray-300" onClick={goToStage(2)} disabled={!(p0DataValid && p1DataValid)} >Review</button>
					</div>
				</div>
				{/* CONTENT */}
				<div className="flex flex-row gap-x-4 relative align-top">
					<div className="flex-[2]">
						<AnimatePresence mode="wait" >
							{
								stage == Stages.P1 &&
								<CheckoutStageZero
									formSubmit={async (newFullName: FormCustomer["fullName"], newAddress: FormCustomer["address"]) => {
										if (!newAddress || !newFullName) return //just for type narrowing, form validation already should catch this

										//recalculating shipping
										if (newFullName == checkoutPayPalCustomer.fullName && isEqual(newAddress, checkoutPayPalCustomer.address)) return goToStage(1)
										setCalculatingShipping(true)
										try {
											const { newPrice } = await updateOrderAddress(CheckoutOrderID, newAddress, newFullName)
											setCheckoutPayPalCustomer(ci => ({ ...ci, fullName: newFullName, address: newAddress }))
											setCheckoutPayPalPrice(newPrice)
											goToStage(1)
										}
										catch (e) {
											console.error(e)
											toast.error("Update Product Server Side Error: check console for more details", { theme: "colored" })
										}
										finally { setCalculatingShipping(false) }
									}}
									p0DataValid={p0DataValid}
									setP0DataValid={setP0DataValid}
									checkoutPayPalCustomer={checkoutPayPalCustomer}
									checkoutOrderCart={init_CheckoutOrderProducts}
									calculatingShipping={calculatingShipping}
								/>
							}
							{stage == Stages.P1 &&
								<CheckoutStageOne
									checkoutPayPalCustomer={checkoutPayPalCustomer}
									paymentSubmitLoading={paymentSubmitLoading}
									p1DataValid={p1DataValid}
									setP1DataValid={setP1DataValid}
									returnP0={() => goToStage(Stages.P0)}
									formSubmit={async (paymentMethod: PaymentMethods, paymentSource: unknown) => {
										setPaymentApproveLoading(true)
										const paymentDataNotChanged = checkoutPayPalCustomer.paymentMethod == paymentMethod && isEqual(checkoutPayPalCustomer.paymentSource, paymentSource)
										if (paymentDataNotChanged) return goToStage(2)
								
										if (paymentMethod == PaymentMethods.PayPal) {
											const { redirect_link } = await approvePayPal(CheckoutOrderID)
											router.push(redirect_link) //customer updating will be handled on SSR when it returns
										}
										else if (paymentMethod == PaymentMethods.Card) {
											try {
												const { newPaymentSource: cardPaymentSource } = await approveCard(CheckoutOrderID, paymentSource as FormCard) // hard cast on purpose
												setCheckoutPayPalCustomer(ci => ({ ...ci, paymentMethod: PaymentMethods.Card, paymentSource: cardPaymentSource }))
												goToStage(2)
											}
											catch (e) {
												toast.error("Approve Card Server Side Error: Check Console for more details", { theme: "colored" })
												console.error(e)
											}
										}
										else toast.error("Invalid Payment Method", { theme: "colored" })
										setPaymentApproveLoading(false)
									}}
								/>
							}
							{
								stage == Stages.P2 &&
								<CheckoutStageTwo
									checkoutPayPalCustomer={checkoutPayPalCustomer}
									checkoutPayPalPrice={checkoutPayPalPrice}
									checkoutOrderCart={init_CheckoutOrderProducts}
									CheckoutOrderID={CheckoutOrderID}
									goToStage={goToStage} // TODO remove
								/>
							}
						</AnimatePresence>
					</div>
					<div className="sticky top-[1rem] flex-[1] self-start p-6 bg-black text-white">
						<Price checkoutPayPalPrice={checkoutPayPalPrice} calculatingShipping={calculatingShipping} />
					</div>
				</div>
			</div>
		</div>
	);
}