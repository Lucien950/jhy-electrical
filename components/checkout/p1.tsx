import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from 'next/router';
// UI
import { RadioGroup } from '@headlessui/react'
import { PaypalSVG, PayPalWhiteSVG } from 'components/paypalSVG';
import { AnimatePresence, motion } from 'framer-motion';
import { Oval } from 'react-loader-spinner';
import { toast } from "react-toastify";
import { displayVariants } from "util/formVariants";
// types
import { CustomerInterface } from "types/customer";
import { CardInfoInterface, cardSchema } from "types/card";
// paypal hosted fields
import { approveCard, approvePayPal } from "util/paypal/client/approvePayment_client";
import { InputField } from "components/inputField";
import { CardElement } from "components/cardElement";
import { isEqual } from "lodash";



const RadioOption = ({ children, value }: { children: (disabled: boolean) => JSX.Element, value: string }) => {
	return (
		<RadioGroup.Option value={value}>
			{({ checked, disabled }) => (
				<div className={`bg-white p-3 py-5 ${disabled ? "hover:cursor-default" : "hover:cursor-pointer"} mb-2 flex flex-row items-center gap-x-2 shadow-md`}>
					<svg className={`h-6 w-6 ${disabled ? "opacity-50" : ""}`} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
						<path d="M9 12.75L11.25 15 15 9.75" className="duration-75" style={{ strokeDasharray: 10, strokeDashoffset: checked ? 0 : 10, transitionProperty: "stroke-dashoffset" }} strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					{children(disabled)}
				</div>
			)}
		</RadioGroup.Option>
	)
}

const useCardInfo = () => {
	const [realCardInfo, setRealCardInfo] = useState<Partial<CardInfoInterface>>({})
	const [inputCardInfo, setInputCardInfo] = useState<Partial<CardInfoInterface>>({})
	useEffect(() => {
		setRealCardInfo({
			...inputCardInfo,
			cardNumber: inputCardInfo.cardNumber?.replaceAll(" ", ""),
			cardExpiry: inputCardInfo.cardExpiry ? ("20" + inputCardInfo.cardExpiry.split("/").reverse().join("-")) : undefined
		})
	}, [inputCardInfo])

	return { cardInfo: realCardInfo, setCardInfo: setInputCardInfo }
}

const useOnlyRemove = <T,>(initialValue: T): [T, () => void] => {
	const [val, setVal] = useState(initialValue)
	const removeVal = () => setVal(undefined as T)
	return [val, removeVal]
}

type PaymentFormProps = {
	// prevCheckoutStage: () => Promise<void>, nextCheckoutStage: () => Promise<void>,
	// setPaymentMethod: (newPaymentMethod: "paypal" | "card") => void,
	customerInfo: CustomerInterface,
	setCustomerInfo: Dispatch<SetStateAction<CustomerInterface>>,
	setStage: Dispatch<SetStateAction<number>>,

	orderID: string
}
const PaymentForm = ({ customerInfo, setCustomerInfo, setStage, orderID }: PaymentFormProps) => {
	const router = useRouter()

	const [paymentMethod, setPaymentMethod] = useState<CustomerInterface["paymentMethod"]>(customerInfo.paymentMethod)
	// PayPal handling
	const [paypalSource, removePayPal] = useOnlyRemove(customerInfo.payment_source?.paypal)
	// Credit Card Handling
	const [cardSource, removeCard] = useOnlyRemove(customerInfo.payment_source?.card)
	const { cardInfo, setCardInfo } = useCardInfo() //form info
	const changeCardInfo = (id: string, val: string) => setCardInfo(oci => ({ ...oci, [id]: val }))

	const validateP1FormError = () => {
		if (!paymentMethod) return "Select a Payment Method"
		if (paymentMethod == "paypal" && paypalSource) return null
		if (paymentMethod == "card" && cardSource) return null
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (paymentMethod == "card") return cardSchema.validate(cardInfo).error?.message || null
		return null
	}
	const p1Done = validateP1FormError() === null



	const approveCardPayment = async () => {
		if ((paymentMethod == "paypal" && paypalSource) || (paymentMethod == "card" && cardSource)) return setStage(2) // no need to approve payment
		if (!p1Done) return toast.error(validateP1FormError(), { theme: "colored" })
		// p1 is now done
		if ((paymentMethod == customerInfo.paymentMethod) && isEqual(cardInfo, customerInfo.payment_source?.card)) return setStage(2)

		setPaymentApproveLoading(true)
		if (paymentMethod == "paypal") {
			const { redirect_link } = await approvePayPal(orderID)
			router.push(redirect_link) //customer updating will be handled on SSR when it returns
		}
		else if (paymentMethod == "card") {
			try {
				const {newPaymentSource: cardPaymentSource} = await approveCard(orderID, cardInfo)
				setCustomerInfo(ci => ({ ...ci, paymentMethod: "card", payment_source: cardPaymentSource }))
				setStage(2)
			}
			catch (e) { toast.error((e as Error).message, { theme: "colored" }) }
			finally { setPaymentApproveLoading(false) }
		}
		else toast("Select a Valid Payment Method or fill in payment information") // SHOULD BE UNREACHABLE CODE 
	}


	// UI State
	const [paymentSubmitLoading, setPaymentApproveLoading] = useState(false)
	const [CardApproveRequired, PayPalApproveRequired] = [paymentMethod == "card" && !cardSource, paymentMethod == "paypal" && !paypalSource]

	return (
		<motion.div variants={displayVariants} transition={{ duration: 0.08 }} initial="hidden" animate="visible" exit="hidden" key="paymentForm">
			{/* Payment Method Select */}
			<div className="bg-gray-200 p-6 mb-4">
				<h1 className="text-xl mb-4"> Payment Method </h1>
				<RadioGroup value={paymentMethod} onChange={setPaymentMethod} className="w-4/5">
					<RadioOption value="paypal">
						{(disabled) => <PaypalSVG className={`h-5 ${disabled ? "opacity-50" : ""}`} />}
					</RadioOption>
					<RadioOption value="card">
						{(disabled) =>
							<>
								<svg className={`h-10 w-10 ${disabled ? "opacity-50" : ""}`} aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
									<path clipRule="evenodd" d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zM19 8.5H1v6A1.5 1.5 0 002.5 16h15a1.5 1.5 0 001.5-1.5v-6zM3 13.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm4.75-.75a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" fillRule="evenodd" />
								</svg>
								<p className={disabled ? "opacity-50" : ""}> Card </p>
							</>
						}
					</RadioOption>
				</RadioGroup>
			</div>
			{/* hosted fields and paypal information */}
			<motion.div className="bg-gray-200 p-6 mb-4" transition={{ duration: 0.1 }}>
				<AnimatePresence mode="wait">
					{
						paymentMethod == "paypal" &&
						<motion.div initial="hidden" animate="visible" exit="hidden" variants={displayVariants} key="paypalPayment">
							<h1 className="text-xl">Paypal Information</h1>
							{
								paypalSource?.email_address
									?
									<div>
										<p>PayPal Email: {paypalSource.email_address}</p>
										<button onClick={removePayPal}>Use Different PayPal Account</button>
									</div>
									: <p> No PayPal information Provided </p>
							}
						</motion.div>
					}
					{
						paymentMethod == "card" &&
						<motion.div initial="hidden" animate="visible" exit="hidden" variants={displayVariants} key="cardPayment">
							<h1 className="mb-4 text-xl"> Card Payment Information </h1>
							{
								cardSource
									?
									<div>
										<CardElement cardInformation={cardSource} />
										<button onClick={removeCard}>Use different card</button>
									</div>
									// Credit Card Form
									:
									<div className="grid grid-cols-3 gap-x-2 gap-y-3">
										<InputField field_id="cardNumber" setField={changeCardInfo} className="col-span-2" mask="9999 9999 9999 9999" label="Card Number" placeholder="4111 1111 1111 1111" />
										<InputField field_id="cardCVV" setField={changeCardInfo} className="col-span-1" mask="999" label="CVV" placeholder="123" />
										<InputField field_id="cardName" setField={changeCardInfo} className="col-span-2" label="Cardholder Name" placeholder="Cardholder Name" />
										<InputField field_id="cardExpiry" setField={changeCardInfo} className="col-span-1" mask="99/99" label="Expiry" placeholder="MM/YY" />
									</div>
							}
						</motion.div>
					}
				</AnimatePresence>
			</motion.div>
			{/* under button */}
			<div className="flex flex-row justify-end gap-x-8 mt-8 items-center">
				<button className="underline" onClick={() => setStage(1)}> Back to Shipping </button>
				<button
					className={`transition-colors duration-300 bg-black ${PayPalApproveRequired && "bg-blue-400"} text-white py-4 w-64 group`}
					onClick={approveCardPayment} disabled={!p1Done || paymentSubmitLoading}
				>
					<motion.div layoutRoot className="h-6 flex flex-row items-center justify-center gap-x-4">
						{
							paymentSubmitLoading && 
							<motion.div layout>
								<Oval height={20} width={20} strokeWidth={7} color="white" secondaryColor="white" />
							</motion.div>
						}
						<motion.div layout className="group-disabled:opacity-75">
						<AnimatePresence mode="wait">
							{
								PayPalApproveRequired
									?
									<motion.div className=" flex flex-row items-center justify-center gap-x-2" key={1}>
										Proceed with <PayPalWhiteSVG className="h-5" />
									</motion.div>
									:
									CardApproveRequired
										?
										<motion.div className="font-semibold" key={2}>Approve Credit Card</motion.div>
										:
										<motion.div className="font-semibold" key={3}> Review </motion.div>
							}
						</AnimatePresence>
						</motion.div>
					</motion.div>
				</button>
			</div>
		</motion.div>
	)
}

export default PaymentForm;