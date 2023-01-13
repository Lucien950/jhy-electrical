// react and next
import { Dispatch, FormEventHandler, MouseEventHandler, SetStateAction, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
// redux
import { Provider, useDispatch, useSelector } from 'react-redux';
// ui
import { AnimatePresence, motion } from 'framer-motion';
import { PaypalSVG, PayPalWhiteSVG } from 'components/paypalSVG';
import { Oval } from 'react-loader-spinner';
import { Combobox, Menu, RadioGroup, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Tippy from '@tippyjs/react';
import PriceComponent from 'components/price';
// api
import getorder from './api/paypal/getorder';
import { calculateShipping } from 'util/calculateShipping';
// firebase to write order
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import db from "util/firebase/firestore"
// types
import customer from 'types/customer';
import { firestoreOrder, Price, productInfo } from 'types/order';
import { clearCart } from 'util/redux/cart.slice';
import { createOrder } from 'util/paypal/createOrder';
import { removePersistCustomer, setPersistCustomer } from 'util/redux/persistCustomer.slice';

// paypal
import {
	PayPalScriptProvider,
	PayPalHostedFieldsProvider,
	PayPalHostedField,
	usePayPalHostedFields,
} from "@paypal/react-paypal-js";

const postalCodePattern = "^(?!.*[DFIOQUdfioqu])[A-VXYa-vxy][0-9][A-Za-z][ -]?[0-9][A-Za-z][0-9]$"

const ProvinceDropdown = ({province, setProvince}: {province: string, setProvince: (p:string)=>void}) => {
	const [query, setQuery] = useState('')
	const provinces = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"]
	const filteredProvinces = query === '' ? [] : provinces.filter((province) => province.toLowerCase().includes(query.toLowerCase()))
	
	return (
		<Combobox value={province} onChange={setProvince} className="relative" as="div">
      <Combobox.Input
				onChange={(event) => setQuery(event.target.value)}
				className="w-full h-full p-2 rounded-sm border-2 focus:outline-none focus:ring"
				placeholder='Province'
			/>
      <Combobox.Options className="absolute bg-white z-10 w-full">
        {filteredProvinces.map((province) => (
          <Combobox.Option key={province} value={province} className="p-2">
            {province}
          </Combobox.Option>
        ))}
      </Combobox.Options>
    </Combobox>
	)
}

interface ShippingFieldProps {
	field_id: string,
	field_placeholder: string,
	className?: string,
	defaultValue?: string,
	required?: boolean,
	pattern?: string,
	customerUpdate: (id: string, val: string) => void
}
const ShippingField = ({ field_id, field_placeholder, className, defaultValue, required = false, pattern, customerUpdate }: ShippingFieldProps) => (
	<input
		type="text" name={field_id} id={field_id}
		className={`p-2 py-4 border-2 rounded-[5px] focus:outline-none focus:ring-2 ${className}`}
		placeholder={field_placeholder} defaultValue={defaultValue}
		onChange={(e) => { customerUpdate(field_id, e.target.value) }}
		required={required}
		pattern={pattern}
	/>
)

const ShippingForm = (
	{ customerInformation, setCustomerInformation, cart, proceedPayment }:
	{ customerInformation: customer, setCustomerInformation: Dispatch<SetStateAction<customer>>, cart: productInfo[], proceedPayment: FormEventHandler<HTMLFormElement> })=>{

	const customerUpdate = (id: string, val:string)=>{
		const newCustomerInformation = {
			...customerInformation,
			[id]: val
		}
		setCustomerInformation(newCustomerInformation)
	}
	const shippingUpdate = (id: string, val: string) => {
		const newCustomerInformation = {
			...customerInformation,
			address: {
				...customerInformation.address,
				[id]: val
			}
		}
		setCustomerInformation(newCustomerInformation)
	}
	
	return(
		<form onSubmit={proceedPayment}>
		{/* review */}
		<div className="p-5 bg-zinc-200 mb-4">
			<h1 className="text-xl">Products</h1>
			<div className="flex flex-col gap-y-2">
				{/* product component */}
				{cart.map(productInfo =>
					<div className="flex flex-row items-center gap-x-2 p-2" key={productInfo.PID}>
						<img src={productInfo.product?.productImageURL} alt="" className="h-10" />
						<p>
							{productInfo.product?.productName}
						</p>
						<p>
							{productInfo.product?.price} x {productInfo.quantity}
						</p>
					</div>
				)}
			</div>
		</div>
		{/* shipping */}
		<div className="p-5 bg-zinc-200">
			<h1 className="text-xl mb-4">Shipping</h1>
			<div className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm">
				<ShippingField required customerUpdate={customerUpdate} field_id="first_name" field_placeholder="First Name" defaultValue={customerInformation.first_name} />
				<ShippingField required customerUpdate={customerUpdate} field_id="last_name" field_placeholder="Last Name" defaultValue={customerInformation.last_name} />
				<ShippingField required customerUpdate={shippingUpdate} field_id="address_line_1" field_placeholder="Address" defaultValue={customerInformation.address.address_line_1!} className="col-span-2" />
				<ShippingField customerUpdate={shippingUpdate} field_id="address_line_2" field_placeholder="Apt/Suite (Optional)" defaultValue={customerInformation.address.address_line_2!} className="col-span-2" />
				<ShippingField required customerUpdate={shippingUpdate} field_id="admin_area_2" field_placeholder="City" defaultValue={customerInformation.address.admin_area_2!} />
				<ProvinceDropdown province={customerInformation.address.admin_area_1!} setProvince={(province: string) => { shippingUpdate("admin_area_1", province) }} />
				<ShippingField required customerUpdate={shippingUpdate} field_id="postal_code" field_placeholder="Postal Code" defaultValue={customerInformation.address.postal_code!} pattern={postalCodePattern}/>
				<div className="relative">
					<input type="text" name="" id="" className="border-2 rounded-[5px] w-full p-2 py-4" disabled />
					<div className="absolute flex flex-row top-[50%] translate-y-[-50%] left-4 items-center gap-x-1">
						<p className="text-gray-400">Canada</p>
						<Tippy content="JHY Canada only ships to Canadian Addresses">
							<svg className="w-5 h-5 stroke-gray-500" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2.3} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</Tippy>
					</div>
				</div>
			</div>
		</div>
		<div className="flex flex-row justify-end gap-x-8 mt-10 items-center">
			<Link href="/cart" className="underline">
				Back to Cart
			</Link>
			<button className="bg-black text-white py-4 px-16" type="submit">Proceed to Payment</button>
		</div>
		</form>
	)
}

const PaymentForm = (
	{ returnShipping, proceedReview, setPaymentMethod, removePaypal, customerInformation, total }:
		{ returnShipping: MouseEventHandler<HTMLButtonElement>, proceedReview: () => void, setPaymentMethod: (newPaymentMethod: "paypal" | "card") => void, removePaypal: MouseEventHandler<HTMLButtonElement>, customerInformation: customer, total: number}
)=>{
	const router = useRouter()
	const dispatch = useDispatch()
	const [paymentSubmitLoading, setPaymentSubmitLoading] = useState(false)
	const [clientID, setClientID] = useState("")

	useEffect(()=>{
		fetch("/api/paypal/clienttoken").then(res=>{
			return res.json()
		})
		.then(token=>{
			console.log(token)
			setClientID(token.client_token)
		})
	}, [])

	const validatePayment = async ()=>{
		if (customerInformation.paymentMethod == "paypal") {
			setPaymentSubmitLoading(true)
			if (customerInformation.paypalInfo) {
				proceedReview()
				return
			}
			const redirect_link = await createOrder(total).catch(err=>console.error(err))
			if(!redirect_link){
				setPaymentSubmitLoading(false)
				return
			}
			dispatch(setPersistCustomer(customerInformation))
			router.push(redirect_link)
		}
		// TODO hosted fields validation
		else if (customerInformation.paymentMethod == "card" && customerInformation.cardInfo) {
			return
		}
		else {
			// TODO display this error
			console.error("Select a Payment Method or fill in payment information")
		}
	}

	const displayVariants = {
		visible: {
			opacity: 1
		},
		hidden: {
			opacity: 0
		}
	}
	const INVALID_COLOR = {
		color: "#dc3545",
	};
	return(
	<>
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
					customerInformation.paymentMethod=="paypal" &&
					<motion.div initial="hidden" animate="visible" exit="hidden" variants={displayVariants} transition={{duration: 0.12}} key="paypalPayment">
						<h1 className="text-xl">Paypal Information</h1>
						<AnimatePresence mode="wait">
							{
								customerInformation.paypalInfo?.paypalEmail ? 
								<motion.div initial="hidden" animate="visible" exit="hidden" variants={displayVariants} transition={{ duration: 0.1 }} key="authorized">
									<p>Paypal Email: {customerInformation.paypalInfo?.paypalEmail}</p>
									<button className="underline" onClick={removePaypal}>Remove</button>
								</motion.div>
								:
								<motion.p initial="hidden" animate="visible" exit="hidden" variants={displayVariants} transition={{ duration: 0.1 }} key="unauthorized">
									PayPal not authorized
								</motion.p>
							}
						</AnimatePresence>
					</motion.div>
				}
				{
					customerInformation.paymentMethod=="card" &&
					<motion.div initial="hidden" animate="visible" exit="hidden" variants={displayVariants} transition={{duration: 0.12}} key="cardPayment">
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
			<button className="underline" onClick={returnShipping}>
				Back to Cart
			</button>
			<button
				className={
					`transition-colors duration-300 bg-black
					${!customerInformation.paypalInfo && customerInformation.paymentMethod =="paypal" && "bg-blue-400"}
					text-white py-4 w-64 group`
				}
				onClick={validatePayment}
				disabled={!customerInformation.paymentMethod}
			>
				{/* TODO (after hosted fields are complete) */}
				{
					!customerInformation.paymentMethod || customerInformation.paypalInfo || customerInformation.paymentMethod == "card" ?
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
							Proceed with <PayPalWhiteSVG className="h-5"/>
						</div>
					</div>
				}
			</button>
		</div>
	</>
)}

const ReviewView = (
	{ customerInformation, submitOrderLoading, cart, goToShipping, goToPayment, submitOrder }:
	{ customerInformation: customer, submitOrderLoading: boolean, cart: productInfo[], goToShipping: MouseEventHandler<HTMLButtonElement>, goToPayment: MouseEventHandler<HTMLButtonElement>, submitOrder: MouseEventHandler<HTMLButtonElement>}
)=>{
	return(
	<>
	{/* shipping address */}
	<div className="bg-gray-200 p-5 flex flex-row mb-2">
		<h1 className="flex-[2] text-base"> Shipping Address </h1>
		<div className="flex-[5]">
			<p> {customerInformation.first_name} {customerInformation.last_name}</p>
			<p> {customerInformation.address.address_line_1} </p>
			<p> {customerInformation.address.address_line_2} </p>
			<p> {customerInformation.address.admin_area_2}, {customerInformation.address.admin_area_1}, {customerInformation.address.postal_code} </p>
		</div>
		<button className="underline" onClick={goToShipping}>Edit</button>
	</div>
	{/* payment method */}
	<div className="bg-gray-200 p-5 flex flex-row mb-2">
		<h1 className="flex-[2] text-base"> Payment Method </h1>
		<div className="flex-[5]">
			{
				customerInformation.paymentMethod == "paypal" &&
				<div>
					<PaypalSVG className="h-6"/>
					<p className="text-sm">Email: {customerInformation.paypalInfo?.paypalEmail}</p>
				</div>
			}
			{
				customerInformation.paymentMethod =="card" &&
				<div>
					{/* TODO After getting cards sorted */}
				</div>
			}
		</div>
		<button className="underline" onClick={goToPayment}>Edit</button>
	</div>
	{/* items */}
	<div className="bg-gray-200 p-5 mb-2">
		<h1 className="mb-4 text-lg"> Items </h1>
		<div className="grid grid-cols-2">
		{cart.map(p=>
			<div className="flex flex-row gap-x-2 items-center" key={p.PID}>
				<img src={p.product?.productImageURL} alt="Product Image" className="h-16"/>
				<div className="flex-1 text-sm">
					<h1 className="font-bold text-base">{p.product?.productName}</h1>
					<p>${p.product?.price.toFixed(2)}</p>
					<p>{p.product?.description}</p>
				</div>
			</div>
		)}
		</div>
	</div>
	{/* submit buttons */}
	<div className="flex flex-row items-center justify-end gap-x-6">
		<button className="underline" onClick={goToPayment}>Back to Payment</button>
		<button className="bg-black p-4 px-24 text-white text-bold relative grid place-items-center" onClick={submitOrder}>
			<Oval height={20} width={20} strokeWidth={8} strokeWidthSecondary={8} color="#28a9fa" secondaryColor="#28a9fa" wrapperClass={`absolute translate-x-[-60px] transition-[opacity] opacity-0 ${submitOrderLoading && "!opacity-100"}`}/>
			<span className={`absolute transition-transform ${submitOrderLoading && "translate-x-[10px]"}`}>
				Submit Order
			</span>
			<span className="invisible">Submit Order</span>
		</button>
	</div>

	{/* line and disclaimer */}
	<hr className='my-4'/>
	<div>
			<p className="font-bold">PLACEHOLDER TEXT, IS NOT REFLECTIVE OF COMPANY POLICY</p>
			<p>By clicking on the &quot;SUBMIT ORDER&quot; button, I agree that I have read and accept these Terms of Use.</p>
			<p> View Privacy Policy. </p>
			<p> Sale and discounted items can only be exchanged or returned for merchandise credit. </p>
			<p> Gift cards may not be redeemed for cash or refunded unless required by law. </p>
	</div>
	</>
)}

export default function Checkout(
	{ paypalCustomerInformation, paypal_error }:
	{ paypalCustomerInformation?: customer, paypal_error?: Error}
){
	// important objects
	const router = useRouter()
	const dispatch = useDispatch()

	// payment information
	const cart = useSelector((state: { cart: productInfo[] }) => state.cart) as productInfo[]
	const [paymentInformation, setPaymentInformation] = useState({
		subtotal: 0,
		shipping: 0,
		tax: 0,
		total: 0,
	} as Price)

	const persistCustomer = useSelector((state: { persistCustomer: customer }) => state.persistCustomer) as customer

	// customer information
	const [customerInformation, setCustomerInformation] = useState({ paymentMethod:"", address:{admin_area_1: "", postal_code: ""}} as customer)
	
	// stages
	const [currentCheckoutStage, setCurrentCheckoutStage] = useState(0)
	const [finalTotalFound, setFinalTotalFound] = useState(false)
	const [paymentMethodFound, setPaymentMethodFound] = useState(false)
	const goToShipping = ()=>{
		setCurrentCheckoutStage(0)
	}
	const goToPayment = () => {
		if(!finalTotalFound){return}
		setCurrentCheckoutStage(1)
	}
	const goToReview = () => {
		if(!(finalTotalFound && paymentMethodFound)){return}
		setCurrentCheckoutStage(2)
	}
	useEffect(()=>{
		setPaymentMethodFound(
			(customerInformation.paymentMethod == "paypal" && !!customerInformation.paypalInfo) ||
			(customerInformation.paymentMethod == "card" && !!customerInformation.cardInfo)
		)
	}, [customerInformation.paymentMethod, customerInformation.paypalInfo, customerInformation.cardInfo])

	// final submit order
	const [submitOrderLoading, setSubmitOrderLoading] = useState(false)

	// onload
	useEffect(() => {
		// usually they coincide, but typescript is very mean sadge
		if (!paypalCustomerInformation){
			dispatch(removePersistCustomer())
			return
		}
		if (paypal_error){
			// TODO display this error
			console.error("PAYPAL ERROR", paypal_error)
			return
		}
		console.log("onload", persistCustomer)

		setCustomerInformation({
			...paypalCustomerInformation,
			...persistCustomer
		})
		dispatch(removePersistCustomer())
		setCurrentCheckoutStage(2)
		setFinalTotalFound(true)
		setPaymentMethodFound(true)
		router.push("/checkout", undefined, { shallow: true })
	}, [])

	// set shipping
	useEffect(() => {
		if (!customerInformation.address.postal_code?.match(new RegExp(postalCodePattern))) {
			setFinalTotalFound(false)
			return;
		}

		console.log("calculated postal code")
		calculateShipping(cart, customerInformation.address.postal_code).then(costs => {
			console.log("set shipping information", costs)
			setPaymentInformation({
				...paymentInformation,
				shipping: cart.reduce((a, p) => a + costs[p.PID] * p.quantity || 0, 0)
			})
			setFinalTotalFound(true)
		})
	}, [customerInformation.address.postal_code])

	// set subtotal (prices)
	useEffect(() => {
		if (cart.length == 0) {
			router.push("/products")
			return
		}
		const total = cart.reduce((acc, p) => acc + (p.product?.price || 0) * p.quantity, 0)
		setPaymentInformation({
			...paymentInformation,
			subtotal: total,
		})
	}, [cart])
	// set tax
	useEffect(() => {
		if (!paymentInformation.subtotal) return
		const TAX_RATE = 0.13
		setPaymentInformation({
			...paymentInformation,
			tax: (paymentInformation.subtotal + paymentInformation.shipping) * TAX_RATE
		})
	}, [paymentInformation.subtotal, paymentInformation.shipping])
	// set total from order and shipping
	useEffect(() => {
		if(!paymentInformation.subtotal || !paymentInformation.shipping || !paymentInformation.tax) return
		setPaymentInformation({
			...paymentInformation,
			total: paymentInformation.subtotal + paymentInformation.shipping + paymentInformation.tax
		})
	}, [paymentInformation.subtotal, paymentInformation.shipping, paymentInformation.tax])

	const handleOrder: MouseEventHandler<HTMLButtonElement> = async () => {
		setSubmitOrderLoading(true)

		const newOrder = {
			products: cart,
			orderPrice: paymentInformation,
			dateTS: Timestamp.now(),

			name: `${customerInformation.first_name} ${customerInformation.last_name}`,
			email: customerInformation.paypalInfo?.paypalEmail,
			address: customerInformation.address,
		} as firestoreOrder

		if (customerInformation.paymentMethod == "paypal") {
			if(!customerInformation.paypalInfo){
				setSubmitOrderLoading(false)
				console.error("Payment Method Paypal does not have paypal information object")
				return
			}
			const updateResponse = await fetch("/api/paypal/updateorder", {
				method: "PATCH",
				body: JSON.stringify({amount: paymentInformation.total, token: customerInformation.paypalInfo.token})
			}).catch(err=>console.error(err))
			if(!updateResponse) return
			const response = await fetch("/api/paypal/submitorder", {
				method: "POST",
				body: JSON.stringify({ token: customerInformation.paypalInfo.token })
			})
				.catch(err => {
					console.error(err)
				})
			if (!response) {
				setSubmitOrderLoading(false)
				return
			}
			newOrder.paypalOrderID = customerInformation.paypalInfo.token
		}
		else if (customerInformation.paymentMethod == "card") {
			// TODO Process Card Hosted Fields
			console.log("process card")
		}
		else {
			console.log(customerInformation.paymentMethod, "is not a valid payment source")
			setSubmitOrderLoading(false)
			return
		}

		const doc = await addDoc(collection(db, "orders"), newOrder)
			.catch(err => {
				console.error(err)
			})

		if (!doc) {
			setSubmitOrderLoading(false)
			return
		}
		dispatch(clearCart())
		router.push(`/order/${doc.id}`)
	}

	const displayVariants = {
		visible: {
			opacity: 1
		},
		hidden:{
			opacity: 0
		}
	}

	return ( 
	<>
		<Head>
			<title>Checkout | JHY Electrical</title>
		</Head>
		<div className="max-w-5xl mx-auto py-8">
			{/* TOP ROW */}
			<div className="flex flex-row justify-between mb-6">
				<Link href="/">
				<img src="/logo.svg" className="h-20" alt="" />
				</Link>

				<div className="flex flex-row items-center self-end text-xl gap-x-5 text-gray-300 stroke-gray-300 transition-colors">
					{/* shipping */}
					<button className="text-black hover:underline" onClick={goToShipping}>Shipping</button>
					{/* arrow */}
					<svg className="h-4 w-4 stroke-black" fill="none" stroke="currentColor" strokeWidth={6} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					{/* payment */}
					<button className={`transition-colors ${finalTotalFound && "text-black hover:underline"}`} onClick={goToPayment} disabled={!finalTotalFound}>Payment</button>
					{/* arrow */}
					<svg className={`transition-colors h-4 w-4 ${finalTotalFound && "stroke-black"}`} fill="none" stroke="currentColor" strokeWidth={6} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					{/* review */}
					<button className={`transition-colors ${finalTotalFound && paymentMethodFound && "text-black hover:underline"}`} onClick={goToReview} disabled={!(finalTotalFound && paymentMethodFound)}>Review</button>
				</div>
			</div>

			{/* CONTENT */}
			<div className="flex flex-row gap-x-4 relative align-top">
				{/* left side */}
				<div className="flex-[2]">
					<AnimatePresence mode="wait" >
						{
							currentCheckoutStage == 0 &&
							<motion.div variants={displayVariants} transition={{duration: 0.08}} initial="hidden" animate="visible" exit="hidden" key="shippingForm">
								<ShippingForm
									customerInformation={customerInformation}
									setCustomerInformation={setCustomerInformation}
									cart={cart}
									proceedPayment={(e)=>{
										e.preventDefault()
										if(!customerInformation.address.admin_area_1){
											// TODO display error frontend
											console.error("Province not Filled")
											return
										}
										if (!paymentInformation.shipping){
											console.error("Shipping Not Estimated")
											return
										}
										// form will check for required automatically from HTML, except for the dropdown
										setCurrentCheckoutStage(1)
									}}
								/>
							</motion.div>
						}
						{
							currentCheckoutStage == 1 &&
							<motion.div variants={displayVariants} transition={{duration: 0.08}} initial="hidden" animate="visible" exit="hidden" key="paymentForm">
								<PaymentForm
									returnShipping={()=>{
										setCurrentCheckoutStage(0)
									}}
									proceedReview={()=>{
										console.log("proceed review")
										setCurrentCheckoutStage(2)
									}}
									customerInformation={customerInformation}
									setPaymentMethod={(newPaymentMethod: "paypal" | "card")=>{
										setCustomerInformation({...customerInformation, paymentMethod: newPaymentMethod})
									}}
									removePaypal={(e)=>{
										const {paypalInfo, ...newCI} = customerInformation
										setCustomerInformation(newCI)
									}}
									total={paymentInformation.total}
								/>
							</motion.div>
						}
						{
							currentCheckoutStage == 2 &&
							<motion.div variants={displayVariants} transition={{duration: 0.08}} initial="hidden" animate="visible" exit="hidden" key="reviewView">
								<ReviewView
									customerInformation={customerInformation}
									cart={cart}
									goToShipping={()=>{setCurrentCheckoutStage(0)}}
									goToPayment={()=>{setCurrentCheckoutStage(1)}}
									submitOrder={handleOrder}
									submitOrderLoading={submitOrderLoading}
								/>
							</motion.div>
						}
					</AnimatePresence>
				</div>

				{/* right side */}
				<div className="sticky top-[1rem] flex-[1] self-start p-6 bg-black text-white">
					<h1 className="text-3xl font-bold">Order Summary</h1>
					<hr className="my-4" />
					
					<AnimatePresence>
						<div className="flex flex-row mb-4" key="subtotal">
							<p className="flex-1"> Subtotal </p>
							<div>
								{
								paymentInformation.subtotal
								?  <PriceComponent price={paymentInformation.subtotal} className="place-self-end" />
								: <Oval height={20} width={20} strokeWidth={7} color="#28a9fa" secondaryColor="#28a9fa"/>
								}
							</div>
						</div>
					{
						paymentInformation.shipping &&
						<motion.div className="flex flex-row mb-4" variants={displayVariants} initial="hidden" animate="visible" exit="hidden" key="shipping">
							<p className="flex flex-row items-center gap-x-2 flex-1">
								<span>
									Shipping
								</span>
								<Tippy content={"Shipping cost is calculated using the Canada Post rate."} delay={50}>
									<svg className="h-5 w-5 focus:outline-none hover:cursor-pointer" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
										<path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
									</svg>
								</Tippy>
							</p>
							<PriceComponent price={paymentInformation.shipping != -1 ? paymentInformation.shipping : 0} className="place-self-end" />
						</motion.div>
					}
					{
						paymentInformation.shipping && paymentInformation.subtotal &&
						<>
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
						<motion.div className="flex flex-row mb-8" variants={displayVariants} initial="hidden" animate="visible" exit="hidden" key="paymentTotal">
							<p className="flex-1">Total</p>
							<PriceComponent price={paymentInformation.total} className="place-self-end" />
						</motion.div>
						</>
					}
					</AnimatePresence>
				</div>
			</div>
		</div>
	</>
	);
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const token = ctx.query.token as string
	if (!token){
		return{
			props:{}
		}
	}

	let error;
	const paypalCustomerInformation = await getorder(token).catch(err=>{
		error = err
	})

	if(!paypalCustomerInformation){
		return{
			props:{
				paypal_error: error
			}
		}
	}
	return {
		props: {
			paypalCustomerInformation
		}
	}
}