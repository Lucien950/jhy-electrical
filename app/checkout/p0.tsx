// react
import { useEffect, useState } from "react";
import Link from "next/link"
// ui
import { Combobox, Transition } from '@headlessui/react'
import { motion } from "framer-motion";
import Tippy from "@tippyjs/react";
import { displayVariants } from "./checkoutFormVariants";
import { toast } from 'react-toastify'
// types
import { FormCustomer } from 'types/customer';
import { Address, postalCodePattern } from "types/address";
import { Oval } from "react-loader-spinner";
import { InputField } from "components/inputField";
import { encodeProductVariantPayPalSku } from "server/paypal/sku";
import { OrderProduct } from "types/order";
import { validateP0FormData, validateP0FormError } from './stages';
import { useProduct, useProductImageURL } from "components/hooks/useProduct";

const ProvinceDropdown = ({ province, setProvince }: { province?: string, setProvince: (newProvince: string) => void }) => {
	const [query, setQuery] = useState('')
	const provinces = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"]
	const filteredProvinces = query === '' ? [] : provinces.filter((province) => province.toLowerCase().includes(query.toLowerCase()))

	return (
		<Combobox value={province || ""} onChange={(s) => setProvince(s)} className="relative" as="div">
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


const ProductListing = ({orderProduct}: {orderProduct: OrderProduct}) => {
	const { product, productLoading } = useProduct(orderProduct)
	const productImageURL = useProductImageURL(`${product?.firestoreID}/${product?.images[0]}` || null)

	if(productLoading || !product) return (<div></div>)
	return (
		<div className="flex flex-row items-center gap-x-2 p-2" key={encodeProductVariantPayPalSku(orderProduct.PID, orderProduct.variantSKU)}>
			<img src={productImageURL || ""} alt="" className="h-10" />
			<p> {product.productName} </p>
			<p> {product.price} x {product.quantity} </p>
		</div>
	)
}

const ShippingForm = ({ checkoutPayPalCustomer, p0DataValid, checkoutOrderCart, calculatingShipping, formSubmit, setP0DataValid }: {
	checkoutPayPalCustomer: FormCustomer,
	p0DataValid: boolean,
	checkoutOrderCart: OrderProduct[],
	calculatingShipping: boolean,
	formSubmit: (newFullName: string, newAddress: Address) => void,
	setP0DataValid: (b: boolean) => void
}) => {
	// INPUT HANDLERS
	const [fullName, setFullName] = useState<string>(checkoutPayPalCustomer.fullName || "")
	const [address, setAddress] = useState<Partial<Address>>(checkoutPayPalCustomer.address || {})

	useEffect(() => setP0DataValid(validateP0FormData(fullName, address)), [fullName, address]) // eslint-disable-line react-hooks/exhaustive-deps

	// We do this (instead of inside the country selector) because it is an exceptional case
	useEffect(() => { setAddress(ad => ({ ...ad, country_code: "CA" })) }, [])

	return (
		<motion.div variants={displayVariants} transition={{ duration: 0.08 }} initial="hidden" animate="visible" exit="hidden" key="shippingForm">
			<form onSubmit={(e) => {
				e.preventDefault(); e.stopPropagation();
				if (!p0DataValid) {
					console.error(validateP0FormError(fullName, address))
					return toast.error(validateP0FormError(fullName, address)?.message || "Something is wrong with the current form", { theme: "colored" })
				}
				formSubmit(fullName, address as Address) // 
			}}>
				{/* review */}
				<div className="p-5 bg-zinc-200 mb-4">
					<h1 className="text-xl mb-4 font-bold">Products</h1>
					{/* product component */}
					<div className="flex flex-col gap-y-2"> 
						{ checkoutOrderCart.map(op => <ProductListing orderProduct={op} key={encodeProductVariantPayPalSku(op.PID, op.variantSKU)}/>) }
					</div>
				</div>

				{/* shipping */}
				<div className="p-5 bg-zinc-200">
					<h1 className="text-xl mb-4 font-bold">Shipping</h1>
					<div className=" grid grid-cols-2 grid-rows-5 gap-x-2 gap-y-2 text-sm " >
						<InputField required
							field_id="fullName" placeholder="Full Name" defaultValue={fullName || ""}
							setField={(s: string) => setFullName(s)}
							className="col-span-2"
						/>
						<InputField required
							field_id="address_line_1" placeholder="Address" defaultValue={address?.address_line_1}
							setField={(s: string) => setAddress(ad => ({ ...ad, address_line_1: s }))}
							className="col-span-2"
						/>
						<InputField
							field_id="address_line_2" placeholder="Apt/Suite (Optional)" defaultValue={address?.address_line_2}
							setField={(s: string) => setAddress(ad => ({ ...ad, address_line_2: s }))}
							className="col-span-2"
						/>
						<InputField required
							field_id="admin_area_2" placeholder="City" defaultValue={address?.admin_area_2}
							setField={(s: string) => setAddress(ad => ({ ...ad, admin_area_2: s }))} />
						<ProvinceDropdown province={address?.admin_area_1} setProvince={(val: string) => setAddress({ ...address, admin_area_1: val })} />
						<InputField required pattern={postalCodePattern}
							field_id="postal_code" placeholder="Postal Code" defaultValue={address?.postal_code}
							setField={(s: string) => setAddress(ad => ({ ...ad, postal_code: s }))}
						/>
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
						<Transition show={calculatingShipping} className="transition-[opacity] duration-200"
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