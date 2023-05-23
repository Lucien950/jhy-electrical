// react
import { Dispatch, FormEventHandler, SetStateAction, useEffect, useRef, useState } from "react";
import Link from "next/link"
// ui
import { Combobox, Transition } from '@headlessui/react'
import { motion } from "framer-motion";
import Tippy from "@tippyjs/react";
import { toast } from "react-toastify";
import { displayVariants } from "./checkoutFormVariants";
// types
import { CustomerInterface } from 'types/customer';
import { postalCodePattern } from "util/shipping/postalCode";
import { Address } from "@paypal/paypal-js"
import { Oval } from "react-loader-spinner";
import { InputField } from "components/inputField";
import { ValidationError } from "joi";
import { OrderProductFilled } from "types/order";
import { updateOrderAddress } from "util/paypal/client/updateOrder_client";
import { PriceInterface } from "types/price";
import { isEqual } from "lodash";

const ProvinceDropdown = ({ province, setProvince }: { province?: string, setProvince: (id: string, val: string) => void }) => {
	const [query, setQuery] = useState('')
	const provinces = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"]
	const filteredProvinces = query === '' ? [] : provinces.filter((province) => province.toLowerCase().includes(query.toLowerCase()))
	const input = useRef<HTMLInputElement>(null)

	return (
		<Combobox value={province || ""} onChange={(s) => setProvince("admin_area_1", s)} className="relative" as="div">
			<Combobox.Input
				required
				onChange={(event) => setQuery(event.target.value)}
				className="w-full h-full p-2 rounded-lg border-2 focus:outline-none focus:ring-2"
				placeholder='Province'
				data-field_id="admin_area_1"
				ref={input}
			/>
			<Combobox.Options className="absolute mt-1 bg-white z-10 w-full rounded-md shadow-md overflow-hidden">
				{filteredProvinces.map((province) => (
					<Combobox.Option key={province} value={province} className={({ active }) => `relative cursor-pointer select-none py-3 pl-10 ${active ? 'bg-teal-600 text-white' : 'text-gray-900'}`}>
						{({ selected, active }) => (
							<>
								<span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`} >
									{province}
								</span>
								{selected ? (
									<span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-teal-600'}`} >
										<svg className="w-5" fill="none" stroke="currentColor" strokeWidth={3}
											viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
											<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
										</svg>
									</span>
								) : null}
							</>
						)}
					</Combobox.Option>
				))}
			</Combobox.Options>
		</Combobox>
	)
}

type p0Input = {
	setStage: Dispatch<SetStateAction<number>>,
	setCustomerInfo: Dispatch<SetStateAction<CustomerInterface>>,
	setPriceInfo: Dispatch<SetStateAction<PriceInterface>>,
	customerInfo: CustomerInterface,
	validateP0Form: (name: CustomerInterface["fullName"], address: CustomerInterface["address"]) => boolean,
	validateP0FormError: (name: CustomerInterface["fullName"], address: CustomerInterface["address"]) => ValidationError | null | undefined,
	orderID: string,
	setCalculatingShipping: Dispatch<SetStateAction<boolean>>,
	// display variables
	orderCart: OrderProductFilled[] | null,
	calculatingShipping: boolean,
}
const ShippingForm = ({ setStage, customerInfo, setCustomerInfo, setPriceInfo, validateP0Form, validateP0FormError, orderID, orderCart, calculatingShipping, setCalculatingShipping }: p0Input) => {
	// INPUT HANDLERS
	const [fullName, setFullName] = useState<CustomerInterface["fullName"]>(customerInfo.fullName)
	const [address, setAddress] = useState<CustomerInterface["address"]>(customerInfo.address)
	const [p0Done, setP0Done] = useState(false)
	useEffect(() => { setP0Done(validateP0Form(fullName, address)) }, [fullName, address]) // eslint-disable-line react-hooks/exhaustive-deps
	const customerChange = (id: string, val: string) => setFullName(val)
	const shippingChange = (id: string, val: string) => setAddress({ ...address, [id]: val } as Address)

	// LEAVE HANDLER
	const proceedPayment: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault()
		if (!p0Done) {
			// this is fine because `!p0Done` already implies there is an error
			//eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const errorMessage = validateP0FormError(fullName, address)!.message
			toast.error(errorMessage, { theme: "colored" })
			return
		}
		if (!address || !fullName) return //just for type narrowing

		if (fullName == customerInfo.fullName && isEqual(address, customerInfo.address)) { setStage(1); return }

		setCalculatingShipping(true)
		try {
			const { newPrice } = await updateOrderAddress(orderID, address, fullName)
			setCustomerInfo(ci => ({ ...ci, fullName, address }))
			setPriceInfo(newPrice)
			setStage(1)
		}
		catch (e) { toast.error((e as Error).message, { theme: "colored" }) }
		finally { setCalculatingShipping(false) }
	}

	return (
		<motion.div variants={displayVariants} transition={{ duration: 0.08 }} initial="hidden" animate="visible" exit="hidden" key="shippingForm">
			<form onSubmit={proceedPayment}>
				{/* review */}
				<div className="p-5 bg-zinc-200 mb-4">
					<h1 className="text-xl mb-4 font-bold">Products</h1>
					{/* product component */}
					<div className="flex flex-col gap-y-2">
						{orderCart
							?
							orderCart.map(productInfo =>
								<div className="flex flex-row items-center gap-x-2 p-2" key={productInfo.PID}>
									<img src={productInfo.product.productImageURL} alt="" className="h-10" />
									<p> {productInfo.product.productName} </p>
									<p> {productInfo.product.price} x {productInfo.quantity} </p>
								</div>
							)
							:
							<div>
								<Oval height={30} strokeWidth={10} strokeWidthSecondary={10} color="black" secondaryColor="black" />
							</div>
						}
					</div>
				</div>
				{/* shipping */}
				<div className="p-5 bg-zinc-200">
					<h1 className="text-xl mb-4 font-bold">Shipping</h1>
					<div className="grid grid-cols-2 grid-rows-5 gap-x-2 gap-y-2 text-sm" data-lpignore="true">
						<InputField required setField={customerChange} field_id="fullName" placeholder="Full Name" defaultValue={fullName || ""} className="col-span-2" />
						<InputField required setField={shippingChange} field_id="address_line_1" placeholder="Address" defaultValue={address?.address_line_1} className="col-span-2" />
						<InputField setField={shippingChange} field_id="address_line_2" placeholder="Apt/Suite (Optional)" defaultValue={address?.address_line_2} className="col-span-2" />
						<InputField required setField={shippingChange} field_id="admin_area_2" placeholder="City" defaultValue={address?.admin_area_2} />
						<ProvinceDropdown setProvince={shippingChange} province={address?.admin_area_1} />
						<InputField required setField={shippingChange} field_id="postal_code" placeholder="Postal Code" defaultValue={address?.postal_code} pattern={postalCodePattern} />
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
						<div></div>
					</div>
				</div>
				<div className="flex flex-row justify-end gap-x-8 mt-10 items-center">
					<Link href="/cart" className="underline">
						Back to Cart
					</Link>
					<button
						className="bg-black text-white py-4 px-16 disabled:text-opacity-50 transition-[color] grid place-items-center relative"
						type="submit" disabled={!p0Done || calculatingShipping}>
							<Transition
								show={calculatingShipping}
								// as={Fragment}
								enter="transition-[opacity] duration-200"
								enterFrom="opacity-0"
								enterTo="opacity-100"
								leave="transition-[opacity] duration-200"
								leaveFrom="opacity-100"
								leaveTo="opacity-0"
							>
								<Oval height={20} strokeWidth={8} wrapperClass="absolute left-[5%]" strokeWidthSecondary={10} color="white" secondaryColor="white"/>
							</Transition>
							<div className={`transition-transform ${calculatingShipping ? "translate-x-[1rem]" : ""}`}>
								Proceed to Payment
							</div>
					</button>
				</div>
			</form>
		</motion.div>
	)
}

export default ShippingForm;