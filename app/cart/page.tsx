"use client"
// react
import { MouseEventHandler, useEffect, useState } from "react";
import Head from "next/head";
// redux
import { useDispatch } from "react-redux"
import { removeFromCart, setQuantity } from "util/redux/cart.slice";
// ui
import Tippy from "@tippyjs/react";
import { useRouter } from "next/navigation";
import { Oval } from "react-loader-spinner";
import { logEvent } from "firebase/analytics";
import { toast } from "react-toastify";
import Price from "components/price";
import { PaypalSVG } from "components/paypalSVG";
import { createPayPalOrder } from "app/checkout/paypalClient";
import { analytics } from "util/firebase/analytics";
// util price
import { Transition } from "@headlessui/react";
import { QuantitySelector } from "components/quantitySelector";
import { clamp } from "lodash";
import { estimatePrice } from "app/checkout/estimatePrice";
import { encodeProductVariantPayPalSku } from "server/paypal/sku";
import { OrderProduct } from "types/order";
import { useAppSelector } from "util/redux/hooks";
import { useProduct, useProductImageURL } from "components/hooks/useProduct";
import { useLazyEffect } from "util/useLazyEffect";

const ProductListing = ({ orderProduct }: { orderProduct: OrderProduct }) => {
	const { product, productLoading } = useProduct(orderProduct)

	const productImageURL = useProductImageURL(`${product?.firestoreID}/${product?.images[0]}` || null)

	const dispatch = useDispatch()
	const removeSelf = () => {
		if (product) logEvent(analytics(), "remove_from_cart", { items: [{ item_id: product.productName, price: product.price, quantity: product.quantity }] })
		dispatch(removeFromCart(orderProduct.PID))
	}

	if (productLoading) {
		return (
			<div></div> // TODO
		)
	}

	if (!product) {
		return (
			<div className="h-20 bg-slate-200 p-4 font-bold grid place-items-center rounded-md">
				<h1>Error: No Product Associated with Product <code className="p-1 bg-slate-300 rounded-sm">{orderProduct.PID}</code></h1>
				<span className="link" onClick={removeSelf}>Remove?</span>
			</div>
		)
	}

	const setProductQuantity = (newQuantity: number) => dispatch(setQuantity({
		PID: orderProduct.PID,
		quantity: clamp(newQuantity, 1, product.quantity),
		variantSKU: orderProduct.variantSKU,
	}))
	const inStock = product.quantity > 0
	return (
		<div className="p-4 flex flex-row gap-x-2">
			<div className='flex-[1_0_3.5rem] grid place-items-center'>
				<img src={productImageURL || ""} alt="Product Image" className="h-14 w-26 object-cover" />
			</div>
			<div className="flex-[4_4_57%]">
				<h1 className="font-medium text-lg">
					{product.productName}
				</h1>
				<div className='flex flex-row items-center gap-x-2'>
					{inStock
						? <p className="text-sm text-green-600">In Stock</p>
						: <p className="text-sm text-red-700">Out of Stock</p>
					}
					<span className="text-sm underline text-blue-500 hover:cursor-pointer" onClick={removeSelf} >
						Remove from Cart
					</span>
				</div>
				<p className="text-gray-600 text-xs">{product.description}</p>
			</div>
			<div className="justify-self-end flex flex-col gap-y-2 justify-between items-end flex-[2_2_29%]">
				<div>
					<Price price={product.price * orderProduct.quantity} />
				</div>
				{
					inStock &&
					<QuantitySelector
						quantity={orderProduct.quantity}
						setQuantity={generateNewQuant => setProductQuantity(generateNewQuant(orderProduct.quantity))}
						maxValue={product.quantity}
					/>
				}
			</div>
		</div>
	)
}

const CostLoader = () => <Oval height={18} width={18} strokeWidth={6} strokeWidthSecondary={6} color="#28a9fa" secondaryColor="#28a9fa" />


const usePrice = (cart: OrderProduct[]) => {
	const [subtotal, setSubtotal] = useState<number | null>(null)
	const [tax, setTax] = useState<number | null>(null)
	const [shipping, setShipping] = useState<number | null>(null)
	const [total, setTotal] = useState<number | null>(null)
	const [loadingPrice, setLoadingPrice] = useState(false)

	useLazyEffect(() => {
		(async () => {
			if (cart.length === 0) return
			setLoadingPrice(true)
			try {
				const newPrice = await estimatePrice(cart.map(p => ({ ...p, product: undefined })))
				setSubtotal(newPrice.subtotal)
				setShipping(newPrice.shipping || 0)
				setTax(newPrice.tax || 0)
				setTotal(newPrice.total)
			} catch (e) {
				toast.error("Error calculating Price")
				console.error(e)
				setSubtotal(null)
				setTax(null)
				setShipping(null)
				setTotal(null)
			}
			setLoadingPrice(false)
		})()
	}, [cart], 1000) //eslint-disable-line react-hooks/exhaustive-deps

	return { subtotal, tax, shipping, total, loadingPrice }
}

export default function Cart() {
	const router = useRouter()
	const cart: OrderProduct[] = useAppSelector(state => state.cart)
	const { subtotal, tax, shipping, total, loadingPrice } = usePrice(cart)

	useEffect(() => logEvent(analytics(), "view_cart"), [])

	// PayPal Express Checkout
	const [paypalLoading, setPaypalLoading] = useState(false)
	const paypalCheckout: MouseEventHandler<HTMLButtonElement> = async () => {
		setPaypalLoading(true)
		try {
			const { redirect_link } = await createPayPalOrder(cart, true)
			router.push(redirect_link)
		}
		catch (e) {
			toast.error((e as Error).message, { theme: "colored" })
			setPaypalLoading(false)
		}
	}
	// Form Checkout
	const [checkoutLoading, setCheckoutLoading] = useState(false)

	return (
		<>
			<Head>
				<title>Cart | JHY Electrical</title>
			</Head>
			<div className="pt-32 pb-10 2xl:px-36 min-h-screen container mx-auto">
				<h1 className="text-6xl font-bold mb-4">Shopping Cart</h1>
				<div className="gap-x-4 flex flex-col md:flex-row gap-y-4 container mx-auto relative">
					{/* CART */}
					<div className="bg-white md:flex-[2]">
						{
							cart.length == 0 ?
								<div className="flex items-center justify-center h-full w-full">
									<h1 className="font-medium text-gray-400 text-xl text-center">Cart is empty</h1>
								</div>
								:
								<>
									{/* toprow */}
									<div className="flex flex-row justify-end w-full px-4 font-bold text-lg py-1">
										<div>Price</div>
									</div>
									<div className="flex flex-col gap-y-2">
										{cart.map(productInfo => <ProductListing orderProduct={productInfo} key={encodeProductVariantPayPalSku(productInfo.PID, productInfo.variantSKU)} />)}
									</div>
								</>
						}
					</div>

					{/* Price information */}
					{
						cart.length > 0 &&
						<div className="w-full md:flex-[1] sticky top-[5rem] self-start">
							{/* blackbox */}
							<div className="p-6 bg-slate-800 text-white">
								<h1 className="text-3xl font-bold">Your Cart</h1>
								<hr className="my-4" />

								{/* Subtotal */}
								<div className="flex flex-row mb-4">
									<p className="flex-1"> Subtotal </p>
									{!loadingPrice ? <Price price={subtotal} className="place-self-end" /> : <CostLoader />}
								</div>
								<div className="flex flex-row mb-4">
									<p className="flex-1"> Shipping </p>
									{!loadingPrice ? <Price price={shipping} className="place-self-end" /> : <CostLoader />}
								</div>
								{/* Tax */}
								<div className="flex flex-row mb-4">
									<p className="flex flex-row items-center gap-x-2 flex-1">
										Tax
										<Tippy content={"Tax is calculated based on your location, or the Ontario rate of 13%"} delay={50}>
											<svg className="h-5 w-5 focus:outline-none hover:cursor-pointer" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
												<path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
											</svg>
										</Tippy>
									</p>
									{!loadingPrice ? <Price price={tax} className="place-self-end" /> : <CostLoader />}
								</div>
								{/* Total */}
								<div className="flex flex-row mb-4">
									<p className="flex-1">Total</p>
									{!loadingPrice ? <Price price={total} className="place-self-end" /> : <CostLoader />}
								</div>
								<p className="text-sm mb-6">*Note that this calculation is an estimation of the final cost based on your <em>approximate location</em></p>

								{/* Checkout Buttons */}
								<div className="text-black">
									{/* paypal */}
									<button className="text-lg p-3 w-full h-[50px] bg-white grid place-items-center relative group"
										onClick={paypalCheckout} disabled={paypalLoading}>
										<Transition
											show={paypalLoading}
											enter="transition-opacity duration-200"
											enterFrom="opacity-0"
											enterTo="opacity-100"
											leave="transition-opacity duration-200"
											leaveFrom="opacity-100"
											leaveTo="opacity-0"
											className="ml-3 mr-2 justify-self-start"
										>
											<Oval height={18} width={18} strokeWidth={10} strokeWidthSecondary={10} color="#28a9fa" secondaryColor="#28a9fa" />
										</Transition>
										<div className={`absolute flex justify-center items-center group-disabled:opacity-60 transition-[transform,opacity] duration-200 delay-300 ${paypalLoading && "translate-x-[14px] !delay-[0s]"}`}>
											<PaypalSVG className="h-4 translate-y-[2px]" />
											<span className="ml-1 font-bold font-paypal leading-none italic">Express Checkout</span>
										</div>
									</button>
									{/* checkout */}
									<button className="text-lg my-2 w-full h-[50px] bg-white grid place-items-center relative group"
										disabled={(cart.length <= 0) || checkoutLoading} onClick={async (e) => {
											e.stopPropagation(); e.preventDefault()
											setCheckoutLoading(true)
											try {
												const { orderID } = await createPayPalOrder(cart, false)
												router.push(`/checkout?token=${orderID}`)
											}
											catch (e) {
												console.error(e)
												toast.error("Checkout Error, check console for details.", { theme: "colored" })
											}
											finally { setCheckoutLoading(false) }
										}}
									>
										<Transition
											show={checkoutLoading}
											enter="transition-opacity duration-200"
											enterFrom="opacity-0"
											enterTo="opacity-100"
											leave="transition-opacity duration-200"
											leaveFrom="opacity-100"
											leaveTo="opacity-0"
											className="ml-3 mr-2 left-[25%] absolute"
										>
											<Oval height={18} width={18} strokeWidth={10} strokeWidthSecondary={10} color="black" secondaryColor="black" />
										</Transition>
										<span className="group-disabled:text-gray-500 font-bold">
											Checkout
										</span>
									</button>
								</div>
							</div>

							<p className="mt-4 text-gray-600 text-sm">
								Prices and shipping costs are not confirmed until you&apos;ve reached the checkout <br />
								Taxes and shipping are calculated based on the shipping address. Estimated shipping is based on your current approximate location. <br />
								The items in your shopping bag are updated on the computer per refresh. Availability is not guaranteed. <br />
							</p>
						</div>
					}
				</div>
			</div>
		</>
	);
}