import { displayVariants } from "util/formVariants";
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from "react";
import { setPersistCustomer } from "util/redux/persistCustomer.slice";
import { createPayPalOrderLink } from 'util/paypal/createOrder';
import { RadioGroup } from '@headlessui/react'
import { PaypalSVG, PayPalWhiteSVG } from 'components/paypalSVG';
import { AnimatePresence, motion } from 'framer-motion';
import { Oval } from 'react-loader-spinner';
import CustomerInterface from "types/customer";
import { toast } from "react-toastify";


type PaymentFormProps = {
	prevCheckoutStage: () => void,
	nextCheckoutStage: () => void,
	setPaymentMethod: (newPaymentMethod: "paypal" | "card") => void,
	removePayPal: () => void,
	customerInformation: CustomerInterface,
	redirect_link: string
}
const PaymentForm = ({ prevCheckoutStage, nextCheckoutStage, setPaymentMethod, removePayPal, customerInformation, redirect_link }:PaymentFormProps) => {
	const router = useRouter()
	const dispatch = useDispatch()
	const [paymentSubmitLoading, setPaymentSubmitLoading] = useState(false)
	const [clientID, setClientID] = useState("")

	useEffect(() => {
		fetch("/api/paypal/clienttoken").then(res => {
			return res.json()
		}).then(token => {
			console.log(token)
			setClientID(token.client_token)
		})
	}, [])

	const validatePayment = async () => {
		if (customerInformation.paymentMethod == "paypal") {
			setPaymentSubmitLoading(true)
			// 
			if (customerInformation.paypalInfo) {
				nextCheckoutStage()
			}
			else{
				dispatch(setPersistCustomer(customerInformation))
				router.push(redirect_link)
			}
		}
		// TODO hosted fields validation
		else if (customerInformation.paymentMethod == "card" && customerInformation.cardInfo) {
			toast("Card Not Implemented Yet, please try again")
			return
		}
		else {
			toast("Select a Valid Payment Method or fill in payment information")
		}
	}

	return (
		<motion.div variants={displayVariants} transition={{ duration: 0.08 }} initial="hidden" animate="visible" exit="hidden" key="paymentForm">
			{/* Payment Method Select */}
			<div className="bg-gray-200 p-6 mb-4">
				<h1 className="text-xl mb-4"> Payment Method </h1>
				<RadioGroup value={customerInformation.paymentMethod} onChange={setPaymentMethod} className="w-4/5">
					<RadioGroup.Option value="paypal">
						{({ checked }) => (
							<div className={` bg-white p-3 py-5 hover:cursor-pointer mb-2 flex flex-row items-center gap-x-2 shadow-md`}>
								<svg className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
									<path d="M9 12.75L11.25 15 15 9.75" className="duration-75" style={{ strokeDasharray: 10, strokeDashoffset: checked ? 0 : 10, transitionProperty: "stroke-dashoffset" }} strokeLinecap="round" strokeLinejoin="round" />
								</svg>
								<PaypalSVG className="h-5" />
							</div>
						)}
					</RadioGroup.Option>
					<RadioGroup.Option value="card">
						{({ checked }) => (
							<div className="bg-white p-3 hover:cursor-pointer mb-2 flex flex-row items-center gap-x-2 shadow-md">
								<svg className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
									<path d="M9 12.75L11.25 15 15 9.75" className="duration-75" style={{ strokeDasharray: 10, strokeDashoffset: checked ? 0 : 10, transitionProperty: "stroke-dashoffset" }} strokeLinecap="round" strokeLinejoin="round" />
								</svg>
								<svg className="h-10 w-10" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
									<path clipRule="evenodd" d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zM19 8.5H1v6A1.5 1.5 0 002.5 16h15a1.5 1.5 0 001.5-1.5v-6zM3 13.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm4.75-.75a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" fillRule="evenodd" />
								</svg>
								Card
							</div>
						)}
					</RadioGroup.Option>
				</RadioGroup>
			</div>
			{/* hosted fields and paypal information */}
			<div className="bg-gray-200 p-6 mb-4">
				<AnimatePresence mode="wait">
					{
						customerInformation.paymentMethod == "paypal" &&
						<motion.div initial="hidden" animate="visible" exit="hidden" variants={displayVariants} transition={{ duration: 0.12 }} key="paypalPayment">
							<h1 className="text-xl">Paypal Information</h1>
							<AnimatePresence mode="wait">
								{
									customerInformation.paypalInfo?.paypalEmail ?
										<motion.div initial="hidden" animate="visible" exit="hidden" variants={displayVariants} transition={{ duration: 0.1 }} key="authorized">
											<p>PayPal Email: {customerInformation.paypalInfo?.paypalEmail}</p>
											<button className="underline" onClick={removePayPal}>Remove</button>
										</motion.div>
										:
										<motion.p initial="hidden" animate="visible" exit="hidden" variants={displayVariants} transition={{ duration: 0.1 }} key="unauthorized">
											No PayPal information Provided
										</motion.p>
								}
							</AnimatePresence>
						</motion.div>
					}
					{
						customerInformation.paymentMethod == "card" &&
						<motion.div initial="hidden" animate="visible" exit="hidden" variants={displayVariants} transition={{ duration: 0.12 }} key="cardPayment">
							{/* TODO Implement Hosted Fields for Card */}
							<h1> Card Payment Information </h1>
							<p>COMING SOON</p>
							{/* {
							clientID &&
							<PayPalScriptProvider
								options={{
									"client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENTID!,
									"data-client-token": clientID,
									components: "hosted-fields",
									// intent: "capture",
									// vault: false,
								}}
							>
								<PayPalHostedFieldsProvider createOrder={async ()=>{
									return fetch("your_custom_server_to_create_orders",
										{
											method: "post",
											headers: { "Content-Type": "application/json", },
											body: JSON.stringify({ purchase_units: [ { amount: { value: total, currency_code: "CAD", }, }, ], intent: "capture", }),
										}
									)
									.then((response) => response.json())
									.then((order) => {
										// Your code here after create the order
										console.log(order)
										return order.id;
									})
									.catch((err) => { alert(err); });
								}}>
									<label htmlFor="card-number">
										Card Number
										<span style={INVALID_COLOR}>*</span>
									</label>
									<PayPalHostedField id="card-number" className="card-field" hostedFieldType="number" options={{ selector: "#card-number", placeholder: "4111 1111 1111 1111", }} />
									<label htmlFor="cvv">
										CVV<span style={INVALID_COLOR}>*</span>
									</label>
									<PayPalHostedField id="cvv" className="card-field" hostedFieldType="cvv" options={{ selector: "#cvv", placeholder: "123", maskInput: true, }} />
									<label htmlFor="expiration-date">
										Expiration Date
										<span style={INVALID_COLOR}>*</span>
									</label>
									<PayPalHostedField id="expiration-date" className="card-field" hostedFieldType="expirationDate" options={{ selector: "#expiration-date", placeholder: "MM/YYYY", }} />
									<SubmitPayment customStyle={{ "border": "1px solid #606060", "boxShadow": "2px 2px 10px 2px rgba(0,0,0,0.1)" }} />
								</PayPalHostedFieldsProvider>
							</PayPalScriptProvider>
						} */}
						</motion.div>
					}
				</AnimatePresence>
			</div>
			{/* under button */}
			<div className="flex flex-row justify-end gap-x-8 mt-8 items-center">
				<button className="underline" onClick={prevCheckoutStage}>
					Back to Cart
				</button>
				<button
					className={
						`transition-colors duration-300 bg-black
					${!customerInformation.paypalInfo && customerInformation.paymentMethod == "paypal" && "bg-blue-400"}
					text-white py-4 w-64 group`
					}
					onClick={validatePayment}
					disabled={!customerInformation.paymentMethod}
				>
					{/* TODO (after hosted fields are complete) */}
					{
						customerInformation.paymentMethod != "paypal" || customerInformation.paypalInfo ?
							<span className="group-disabled:opacity-75">
								Review
							</span>
							:
							<div className="relative h-6 grid place-items-center">
								<Oval
									height={20} width={20}
									wrapperClass={`absolute z-10 translate-x-[-100px] transition-[opacity] opacity-0 ${paymentSubmitLoading && "!opacity-100"}`}
									strokeWidth={7} color="white" secondaryColor="white"
								/>
								<div className={`flex flex-row items-center justify-center gap-x-2 absolute transition-transform  ${paymentSubmitLoading && "translate-x-[10px]"}`}>
									Proceed with <PayPalWhiteSVG className="h-5" />
								</div>
							</div>
					}
				</button>
			</div>
		</motion.div>
	)
}

export default PaymentForm;