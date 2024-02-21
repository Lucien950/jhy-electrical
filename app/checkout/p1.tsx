import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { useImmutable } from "components/hooks/useImmutable";
import { validateP1FormData, validateP1FormError } from './stages';
// UI
import { RadioGroup } from '@headlessui/react'
import { PaypalSVG, PayPalWhiteSVG } from 'components/paypalSVG';
import { AnimatePresence, motion } from 'framer-motion';
import { Oval } from 'react-loader-spinner';
import { displayVariants } from "./checkoutFormVariants";
import { toast } from "react-toastify";
// types
import { FormCustomer, PaymentMethods } from "types/customer";
import { FormCard } from "types/card";
// paypal hosted fields
import { InputField } from "components/inputField";
import { CardElement } from "components/cardElement";
import { PaymentSource } from "types/paypal";

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

const PaymentMethodSelector = ({ paymentMethod, setPaymentMethod, hasLockedInPayPal }: {
	paymentMethod: PaymentMethods | null,
	setPaymentMethod: (p: PaymentMethods) => void,
	hasLockedInPayPal: boolean
}) => (
	<div className="bg-gray-200 p-6 mb-4">
		<h1 className="text-xl mb-4"> Payment Method </h1>
		<RadioGroup value={paymentMethod} onChange={setPaymentMethod} className="w-4/5" disabled={hasLockedInPayPal}>
			<RadioOption value={PaymentMethods.PayPal}>
				{(disabled) => <PaypalSVG className={`h-5 ${disabled ? "opacity-50" : ""}`} />}
			</RadioOption>
			<RadioOption value={PaymentMethods.Card}>
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
		{
			hasLockedInPayPal &&
			<p className="mt-4 text-sm"> PayPal Account Selected. If you would like to complete a guest checkout, please go back to <Link href="/cart" className="link">cart</Link> and start another order </p>
		}
	</div>
)

const CardForm = ({ setCardInfo }: {
	setCardInfo: Dispatch<SetStateAction<Partial<FormCard>>>,
}) => (
	<>
		<h1 className="mb-4 text-xl"> Enter Card Payment Information </h1>
		<div className="grid grid-cols-[2fr_1fr] gap-x-2 gap-y-3">
			<InputField field_id="cardNumber" required mask="9999 9999 9999 9999" label="Card Number" placeholder="4111 1111 1111 1111"
				setField={(val: string) => setCardInfo(oci => ({ ...oci, cardNumber: val }))}
			/>
			<InputField field_id="cardCVV" required mask="999" label="CVV" placeholder="123"
				setField={(val: string) => setCardInfo(oci => ({ ...oci, cardCVV: val }))}
			/>
			<InputField field_id="cardName" required label="Cardholder Name" placeholder="Cardholder Name"
				setField={(val: string) => setCardInfo(oci => ({ ...oci, cardName: val }))}
			/>
			<InputField field_id="cardExpiry" required mask="99/99" label="Expiry" placeholder="MM/YY"
				setField={(val: string) => setCardInfo(oci => ({ ...oci, cardExpiry: val }))}
			/>
		</div>
	</>
)

const CardDisplay = ({ cardSource, removeCard }: {
	cardSource: NonNullable<PaymentSource["card"]>,
	removeCard: () => void,
}) => (
	<>
		<h1 className="mb-4 text-xl"> Enter Card Payment Information </h1>
		<div>
			<div>
				<CardElement cardInformation={cardSource} />
			</div>
			<button onClick={removeCard}>Use different card</button>
		</div>
	</>
)

const PayPalForm = () => (
	<p>Enter PayPal information by clicking button below:</p>
)

const PayPalDisplay = ({ paypalSource, removePayPal }: {
	paypalSource: NonNullable<PaymentSource["paypal"]>,
	removePayPal: () => void
}) => (
	<>
		<h1 className="text-xl">Paypal Information</h1>
		<div>
			<p>PayPal Email: {paypalSource.email_address || "[email not present]"}</p>
			<button onClick={removePayPal}>Use Different PayPal Account</button>
		</div>
	</>
)


const SubmitPaymentButton = ({ PaymentMethod: PaymentMethod, NeedsApproval, paymentSubmitLoading }: {
	NeedsApproval: boolean,
	PaymentMethod: PaymentMethods | null,
	paymentSubmitLoading: boolean
}) => {
	const opacityVariants = {
		hide: { opacity: 0, transition: { duration: 0.35 } },
		show: { opacity: 1, transition: { duration: 0.1 } }
	}
	return (
		<button type="submit" disabled={paymentSubmitLoading}
			className={`transition-colors duration-300 bg-black ${PaymentMethod == PaymentMethods.PayPal && NeedsApproval && "bg-blue-400"} text-white py-4 w-64 group`}
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
							NeedsApproval && PaymentMethod == PaymentMethods.PayPal &&
							<motion.div initial="hide" animate="show" exit="hide" variants={opacityVariants} className=" flex flex-row items-center justify-center gap-x-2" key={1}>
								Proceed with <PayPalWhiteSVG className="h-5" />
							</motion.div>
						}
						{
							NeedsApproval && PaymentMethod == PaymentMethods.Card &&
							<motion.div initial="hide" animate="show" exit="hide" variants={opacityVariants} className="font-semibold" key={2}>
								Approve Credit Card
							</motion.div>
						}
						{
							(!NeedsApproval || !PaymentMethod) &&
							<motion.div initial="hide" animate="show" exit="hide" variants={opacityVariants} className="font-semibold" key={3}>
								Review
							</motion.div>
						}
					</AnimatePresence>
				</motion.div>
			</motion.div>
		</button>
	)
}

const useCardInfo = () => {
	const [cardInfo, setCardInfo] = useState<Partial<FormCard>>({})
	const [formCardInfo, setFormCardInfo] = useState<Partial<FormCard>>({})
	useEffect(() => {
		setCardInfo({
			...formCardInfo,
			cardNumber: formCardInfo.cardNumber?.replaceAll(" ", ""),
			cardExpiry: formCardInfo.cardExpiry ? ("20" + formCardInfo.cardExpiry.split("/").reverse().join("-")) : undefined
		})
	}, [formCardInfo])

	return { cardInfo: cardInfo, setCardInfo: setFormCardInfo }
}

export default function PaymentForm({ checkoutPayPalCustomer, paymentSubmitLoading, p1DataValid, returnP0, formSubmit, setP1DataValid }: {
	checkoutPayPalCustomer: FormCustomer,
	paymentSubmitLoading: boolean,
	p1DataValid: boolean,
	setP1DataValid: (s: boolean) => void,
	returnP0: () => void,
	formSubmit: (ps: PaymentSource | null, pm: PaymentMethods, fd: unknown) => void,
}) {
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethods | null>(checkoutPayPalCustomer.paymentMethod || null)
	
	// NOTE ON THIS PIECE OF DATA: if it is not null, that means it 
	const [existingPaymentSource, removeExistingPaymentSource] = useImmutable(checkoutPayPalCustomer.paymentSource || null)
	// forms
	// paypal omitted because there is no metadata
	const { cardInfo: cardForm, setCardInfo } = useCardInfo() //form info

	useEffect(() => {
		if(paymentMethod == PaymentMethods.Card) setP1DataValid(validateP1FormData(existingPaymentSource, paymentMethod, cardForm));
		else if(paymentMethod == PaymentMethods.PayPal) setP1DataValid(validateP1FormData(existingPaymentSource, paymentMethod, null));
		else setP1DataValid(false)
	}, [paymentMethod, cardForm]) // eslint-disable-line react-hooks/exhaustive-deps

	// This exists because once an order is associated with a paypal account, you cannot unbind it
	const hasLockedInPayPal = (checkoutPayPalCustomer.paymentMethod == PaymentMethods.PayPal && !!checkoutPayPalCustomer.paymentSource?.paypal)

	// ui vars
	return (
		<motion.div variants={displayVariants} transition={{ duration: 0.08 }} initial="hidden" animate="visible" exit="hidden" key="paymentForm">
			<form onSubmit={(e) => {
				e.preventDefault();e.stopPropagation()
				if (!p1DataValid){
					const usedForm = paymentMethod == PaymentMethods.Card ? cardForm : null
					const message = validateP1FormError(existingPaymentSource, paymentMethod, usedForm)!
					return toast.error(message, { theme: "colored" })
				}
				
				if (paymentMethod == PaymentMethods.Card) {
					formSubmit(existingPaymentSource, PaymentMethods.Card, cardForm)
				} else {
					formSubmit(existingPaymentSource, PaymentMethods.PayPal, null)
				}
			}}>
				{/* Payment Method Select */}
				<PaymentMethodSelector paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} hasLockedInPayPal={hasLockedInPayPal} />
				{/* hosted fields and paypal information */}
				<motion.div className="bg-gray-200 p-6 mb-4" transition={{ duration: 0.1 }}>
					<AnimatePresence mode="wait">
						<motion.div initial="hidden" animate="visible" exit="hidden" variants={displayVariants} key={`${paymentMethod}|${existingPaymentSource === null}`}>
							{ existingPaymentSource !== null && paymentMethod == PaymentMethods.PayPal &&
								<PayPalDisplay paypalSource={existingPaymentSource.paypal!} removePayPal={removeExistingPaymentSource} /> }
							{ existingPaymentSource !== null && paymentMethod == PaymentMethods.Card &&
								<CardDisplay cardSource={existingPaymentSource.card!} removeCard={removeExistingPaymentSource} /> }
							{ existingPaymentSource === null && paymentMethod == PaymentMethods.PayPal && <PayPalForm /> }
							{ existingPaymentSource === null && paymentMethod == PaymentMethods.Card && <CardForm setCardInfo={setCardInfo} /> }
						</motion.div>
					</AnimatePresence>
				</motion.div>
				{/* under button */}
				<div className="flex flex-row justify-end gap-x-8 mt-8 items-center">
					<button className="underline" onClick={returnP0}> Back to Shipping </button>
					{/* Submit button */}
					<SubmitPaymentButton
						PaymentMethod={paymentMethod}
						NeedsApproval={existingPaymentSource === null}
						paymentSubmitLoading={paymentSubmitLoading}
					/>
				</div>
			</form>
		</motion.div>
	)
}