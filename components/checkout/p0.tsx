// react
import { Dispatch, FormEventHandler, SetStateAction, useRef, useState } from "react";
import Link from "next/link"
// ui
import { Combobox } from '@headlessui/react'
import { motion } from "framer-motion";
import Tippy from "@tippyjs/react";
import { toast } from "react-toastify";
import { displayVariants } from "util/formVariants";
// types
import CustomerInterface from 'types/customer';
import { OrderProduct } from "types/order";
import { PriceInterface } from "types/price";
import { postalCodePattern } from "util/shipping/postalCode";
import { Address } from "@paypal/paypal-js"
import { Oval } from "react-loader-spinner";


const ProvinceDropdown = ({ province, setProvince }: { province?: string, setProvince: (id: string, val: string) => void }) => {
	const [query, setQuery] = useState('')
	const provinces = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"]
	const filteredProvinces = query === '' ? [] : provinces.filter((province) => province.toLowerCase().includes(query.toLowerCase()))
	const input = useRef<HTMLInputElement>(null)

	return (
		<Combobox value={province} onChange={(s) => setProvince("admin_area_1", s)} className="relative" as="div">
			<Combobox.Input
				onChange={(event) => setQuery(event.target.value)}
				className="w-full h-full p-2 rounded-sm border-2 focus:outline-none focus:ring"
				placeholder='Province'
				data-field_id="admin_area_1"
				ref={input}
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
	setField: (id: string, value: string) => void
}
const ShippingField = ({ field_id, field_placeholder, className, defaultValue, required = false, pattern, setField }: ShippingFieldProps) => {
	return (
		<input
			type="text" name={field_id} id={field_id}
			onChange={(e)=>setField(field_id, e.target.value)}
			className={`p-2 py-4 border-2 rounded-[5px] focus:outline-none focus:ring-2 ${className}`}
			placeholder={field_placeholder} defaultValue={defaultValue}
			required={required}
			pattern={pattern}
		/>
	)
}


type p0Input = {
	customerInformation: CustomerInterface,
	cart?: OrderProduct[], paymentInformation: PriceInterface,
	nextCheckoutStage: () => void,
	canGoToPayment: boolean,
	setCustomerInformation: Dispatch<SetStateAction<CustomerInterface>>,
}
const p0 = ({ customerInformation, setCustomerInformation, cart, paymentInformation, canGoToPayment, nextCheckoutStage }: p0Input) => {

	const proceedPayment: FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault()
		// this is the only onr which are not auto handled "required" by the HTML form
		if (!customerInformation.address?.admin_area_1) {
			toast("Province not Filled")
			return
		}

		// just for display reasons, nextCheckoutStage will check again
		if (!paymentInformation.shipping) {
			toast.warn("Shipping Not Estimated", { theme: "colored" })
			return
		}
		nextCheckoutStage()
	}

	const customerChange = (id: string, val: string)=>{
		setCustomerInformation(ci=>({
			...ci,
			[id]: val
		}))
	}
	const shippingChange = (id: string, val: string)=>{
		setCustomerInformation(ci=>({
			...ci,
			address:{
				...ci.address,
				[id]: val
			} as Address
		}))
	}

	return (
		<motion.div variants={displayVariants} transition={{ duration: 0.08 }} initial="hidden" animate="visible" exit="hidden" key="shippingForm">
			<form onSubmit={proceedPayment}>
				{/* review */}
				<div className="p-5 bg-zinc-200 mb-4">
					<h1 className="text-xl">Products</h1>
					<div className="flex flex-col gap-y-2">
						{/* product component */}
						{cart
							? cart.map(productInfo =>
								<div className="flex flex-row items-center gap-x-2 p-2" key={productInfo.PID}>
									<img src={productInfo.product?.productImageURL} alt="" className="h-10" />
									<p>
										{productInfo.product?.productName}
									</p>
									<p>
										{productInfo.product?.price} x {productInfo.quantity}
									</p>
								</div>
							)
							: <div>
									<Oval height={30} strokeWidth={10} strokeWidthSecondary={10} color="black" secondaryColor="black" />
								</div>
						}
					</div>
				</div>
				{/* shipping */}
				<div className="p-5 bg-zinc-200">
					<h1 className="text-xl mb-4">Shipping</h1>
					<div className="grid grid-cols-2 gap-x-2 gap-y-2 text-sm">
						<ShippingField required setField={customerChange} field_id="fullName" 		field_placeholder="Full Name" 						  defaultValue={customerInformation.fullName} />
						<ShippingField required setField={shippingChange} field_id="address_line_1" field_placeholder="Address" 							defaultValue={customerInformation.address?.address_line_1} className="col-span-2" />
						<ShippingField          setField={shippingChange} field_id="address_line_2" field_placeholder="Apt/Suite (Optional)" 	defaultValue={customerInformation.address?.address_line_2} className="col-span-2" />
						<ShippingField required setField={shippingChange} field_id="admin_area_2"   field_placeholder="City" 									defaultValue={customerInformation.address?.admin_area_2} />
						<ProvinceDropdown 	 setProvince={shippingChange} province={customerInformation.address?.admin_area_1} />
						<ShippingField required setField={shippingChange} field_id="postal_code" 		field_placeholder="Postal Code" 					defaultValue={customerInformation.address?.postal_code} pattern={postalCodePattern} />
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
					<button className="bg-black text-white py-4 px-16 disabled:text-gray-400" type="submit" disabled={!canGoToPayment}>Proceed to Payment</button>
				</div>
			</form>
		</motion.div>
	)
}

export default p0;