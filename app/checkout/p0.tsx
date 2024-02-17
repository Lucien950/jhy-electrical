// react
import { Dispatch, FormEventHandler, SetStateAction, useEffect, useState } from "react";
import Link from "next/link"
// ui
import { Combobox, Transition } from '@headlessui/react'
import { motion } from "framer-motion";
import Tippy from "@tippyjs/react";
import { toast } from "react-toastify";
import { displayVariants } from "./checkoutFormVariants";
// types
import { CustomerInterface } from 'types/customer';
import { Address, postalCodePattern } from "types/address";
import { Oval } from "react-loader-spinner";
import { InputField } from "components/inputField";
import { updateOrderAddress } from "app/checkout/paypalClient";
import { PriceInterface } from "types/price";
import { isEqual } from "lodash";
import { encodePayPalSKU } from "server/paypal/sku";
import { OrderProduct } from "types/order";

const ProvinceDropdown = ({ province, setProvince }: { province?: string, setProvince: (id: string, val: string) => void }) => {
	const [query, setQuery] = useState('')
	const provinces = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"]
	const filteredProvinces = query === '' ? [] : provinces.filter((province) => province.toLowerCase().includes(query.toLowerCase()))

	return (
		<Combobox value={province || ""} onChange={(s) => setProvince("admin_area_1", s)} className="relative" as="div">
			<Combobox.Input
				required
				onChange={(event) => setQuery(event.target.value)}
				className="w-full h-full border-2 px-3 py-4 rounded-lg text-base focus:outline-none focus:ring-2"
				placeholder='Province'
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
	setPriceInfo: Dispatch<SetStateAction<PriceInterface>>,
	customerInfo: CustomerInterface,
	addP0CustomerInfo: (name: string, address: Address) => void,

	validateP0Form: (name: CustomerInterface["fullName"], address: CustomerInterface["address"]) => boolean,
	validateP0FormError: (name: CustomerInterface["fullName"], address: CustomerInterface["address"]) => Error | undefined,
	CheckoutOrderID: string,
	setCalculatingShipping: Dispatch<SetStateAction<boolean>>,
	// display variables
	orderCart: OrderProduct[] | null,
	calculatingShipping: boolean,
}
const ShippingForm = ({
	setStage, customerInfo, addP0CustomerInfo, setPriceInfo,
	validateP0Form, validateP0FormError, CheckoutOrderID, orderCart,
	calculatingShipping, setCalculatingShipping
}: p0Input) => {
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
		// this is fine because `!p0Done` already implies there is an error
		//eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (!p0Done) return toast.error(validateP0FormError(fullName, address)!.message, { theme: "colored" })
		if (!address || !fullName) return //just for type narrowing, form validation already should catch this
		if (fullName == customerInfo.fullName && isEqual(address, customerInfo.address)) return setStage(1)

		setCalculatingShipping(true)
		try {
			const { newPrice } = await updateOrderAddress(CheckoutOrderID, address, fullName)
			addP0CustomerInfo(fullName, address)
			setPriceInfo(newPrice)
			setStage(1)
		}
		catch (e) {
			console.error(e)
			toast.error("Update Product Server Side Error: check console for more details", { theme: "colored" }) 
		}
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
								<div className="flex flex-row items-center gap-x-2 p-2" key={encodePayPalSKU(productInfo.PID, productInfo.variantSKU)}>
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
					<div className=" grid grid-cols-2 grid-rows-5 gap-x-2 gap-y-2 text-sm " >
						<InputField required setField={customerChange} field_id="fullName" placeholder="Full Name" defaultValue={fullName || ""} className="col-span-2" />
						<InputField required setField={shippingChange} field_id="address_line_1" placeholder="Address" defaultValue={address?.address_line_1} className="col-span-2" />
						<InputField setField={shippingChange} field_id="address_line_2" placeholder="Apt/Suite (Optional)" defaultValue={address?.address_line_2} className="col-span-2" />
						<InputField required setField={shippingChange} field_id="admin_area_2" placeholder="City" defaultValue={address?.admin_area_2} />
						<ProvinceDropdown setProvince={shippingChange} province={address?.admin_area_1} />
						<InputField required setField={shippingChange} field_id="postal_code" placeholder="Postal Code" defaultValue={address?.postal_code} pattern={postalCodePattern} />
						<div className="relative">
							<InputField field_id="country" disabled />
							<div className="absolute inset-0 pl-4 flex flex-row items-center gap-x-1">
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

				{/* Bottom Buttons */}
				<div className="flex flex-row justify-end gap-x-8 mt-10 items-center">
					<Link href="/cart" className="underline">
						Back to Cart
					</Link>
					<button type="submit" disabled={calculatingShipping}
						className="grid place-items-center relative
						bg-black text-white py-4 px-16 disabled:text-opacity-50 transition-[color]">
						<Transition
							show={calculatingShipping}
							className="transition-[opacity] duration-200"
							enterFrom="opacity-0" enterTo="opacity-100" leaveFrom="opacity-100" leaveTo="opacity-0"
						>
							<Oval height={20} strokeWidth={8} wrapperClass="absolute left-[5%]"
								strokeWidthSecondary={10} color="white" secondaryColor="white" />
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