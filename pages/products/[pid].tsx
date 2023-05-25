// next
import { GetServerSideProps } from 'next'
import { MouseEventHandler, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from 'util/redux/cart.slice';
// types
import { ProductInterface } from 'types/product'
import { OrderProduct } from 'types/order';
// analytics
import { logEvent } from "firebase/analytics";
import { analytics } from "util/firebase/analytics";
// util
import { getProductByID } from 'util/productUtil'
import { createPayPalOrderLink } from 'util/paypal/client/createOrder_client';
// ui
import Price from 'components/price'
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ResidentialIcon, CommercialIcon, IndustrialIcon } from 'components/categoryIcons'
import { PayPalWhiteSVG } from 'components/paypalSVG';
import { Oval } from 'react-loader-spinner';
import { QuantitySelector } from 'components/quantitySelector';

type AddCartButtonProps = { available: boolean, onClick: () => void }
const AddCartButton = ({ available, onClick }: AddCartButtonProps) => {
	// ANIMATIONS
	const [animating, setAnimating] = useState(false)
	const animationDuration = 1.8 // time in seconds
	const fallingEdgeAnimationDuration = 1.2
	const animateCart = () => {
		setAnimating(true)
		setTimeout(() => {
			setAnimating(false)
		}, animationDuration * 1000 + fallingEdgeAnimationDuration * 1000)
	}

	// ANIMATE + HANDLE CART
	const handleCartButtonClick = () => {
		onClick()
		animateCart()
	}

	return (
		<button
			onClick={handleCartButtonClick}
			className={`w-full border-2 p-2 px-4 relative overflow-hidden
				bg-white text-blue-600 border-blue-600
				transition-transform hover:scale-[102%] active:scale-90
				disabled:scale-100 ${animating ? "" : "disabled:text-blue-300 disabled:border-blue-300"}`}
			disabled={animating || !available}
		>
			{
				available || animating
					?
					<>
						{/* DEFAULT VIEW */}
						<div
							className="relative transition-all duration-200 left-[50%]"
							style={{
								transform: `scale(${animating ? 0 : 1}) translateX(-50%)`,
								opacity: animating ? "0" : "1",
								transitionDelay: animating ? "" : "0.15s",
								transformOrigin: "left"
							}}
						>
							<div className="inline-flex flex-row items-center gap-x-1 font-bold">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
								</svg>
								Add to Cart
							</div>
						</div>

						{/* shopping cart animation */}
						{
							(animating) &&
							<motion.svg
								className="w-6 h-6 absolute top-2 right-full"
								animate={{ left: ["-9%", "50%", "50%", "109%"], rotate: [-16, 0, 0, -16], x: "-50%" }}
								transition={{
									duration: animationDuration,
									times: [0.3, 0.4, 0.45, 1],
									left: {
										duration: animationDuration,
										times: [0, 0.45, 0.55, 1],
										ease: [0.545, -0.6, 0.235, 0.990]
									}
								}}
								initial={false}
								fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
							</motion.svg>
						}

						{/* ADDED VIEW */}
						<div
							className="absolute transition-all left-[50%] top-2 duration-200"
							style={{
								transitionDelay: animating ? `${animationDuration}s` : "",
								opacity: animating ? "1" : "0",
								transform: `translate(-50%, ${animating ? 0 : 12}px)`
							}}
						>
							Added
						</div>
					</>
					:
					<div>No more stock</div>
			}
		</button>
	)
}

const ProductID = ({ product }: { product: ProductInterface }) => {
	const router = useRouter()
	const dispatch = useDispatch()
	const cart = useSelector((state: { cart: OrderProduct[] }) => state.cart) as OrderProduct[]

	// Quantity Adjuster
	const quantityInCart = cart.find(p => p.PID == product.firestoreID)?.quantity || 0
	const availableToAdd = product.quantity - quantityInCart
	const [selectedQuantity, setSelectedQuantity] = useState(Math.min(availableToAdd, 1)) //either 0 or 1
	useEffect(() => {
		setSelectedQuantity(s => Math.min(s, availableToAdd)) //clamp to below availableToAdd
	}, [cart]) // eslint-disable-line react-hooks/exhaustive-deps

	// Add to Cart Button
	const addCartHandler = () => {
		if (availableToAdd <= 0) return toast.error("No more stock") // should be unreachable code, if button is acting right.
		dispatch(addToCart({ PID: product.firestoreID, product, quantity: selectedQuantity }))
		logEvent(analytics(), "add_to_cart", { PID: product.firestoreID })
	}

	// Buy Now Button
	const [buyNowButtonLoading, setbuyNowButtonLoading] = useState(false)
	const buyNow: MouseEventHandler<HTMLButtonElement> = async () => {
		setbuyNowButtonLoading(true)
		try {
			const { redirect_link } = await createPayPalOrderLink([{ PID: product.firestoreID, quantity: selectedQuantity, product }], true)
			router.push(redirect_link)
		}
		catch (e) {
			toast.error((e as Error).message, { theme: "colored" })
			setbuyNowButtonLoading(false)
		}
	}
	return (
		<>
			<Head>
				<title>{product.productName} | JHY Electrical</title>
			</Head>
			<div className="grid grid-cols-1 gap-y-4 lg:grid-cols-2 gap-x-24 mt-36 px-8 container mx-auto">
				<div>
					<img src={product.productImageURL} alt={`Product Image for ${product.productName}`} className="w-full" />
				</div>
				<div>
					<div className="p-4">
						{/* Basic Information */}
						<h1 className="font-bold text-4xl mb-1">{product.productName}</h1>
						<p className="mb-4 text-lg">{product.description}</p>
						<p className="mb-1 text-lg">{product.quantity} in stock</p>
						<div className="mb-3">
							<Price price={product.price} large />
						</div>

						{/* Categories */}
						<div className="flex flex-row gap-x-4 mb-3 flex-wrap">
							{product.residential && <div className="flex flex-row items-center gap-x-2">{<ResidentialIcon className="w-10 h-10" />} Residential</div>}
							{product.commercial && <div className="flex flex-row items-center gap-x-2">{<CommercialIcon className="w-10 h-10" />} Commercial</div>}
							{product.industrial && <div className="flex flex-row items-center gap-x-2">{<IndustrialIcon className="w-10 h-10" />} Industrial</div>}
						</div>

						{/* Quantity Adjuster */}
						<div className="flex flex-row items-center gap-x-4 my-4">
							Qty
							<QuantitySelector quantity={selectedQuantity} setQuantity={setSelectedQuantity} maxValue={availableToAdd} />
						</div>

						{/* Add Cart */}
						<AddCartButton available={availableToAdd > 0} onClick={addCartHandler} />
						<button
							onClick={buyNow} disabled={(selectedQuantity <= 0) || buyNowButtonLoading}
							className={
								`mt-2 p-3 w-full relative grid place-items-center
								font-bold bg-blue-700 text-white 
								hover:scale-[102%] transition-transform active:scale-[97%]
								${selectedQuantity <= 0 ? "disabled:bg-blue-300 disabled:scale-100" : ""}`
							}
						>
							<Oval height={18} width={18} strokeWidth={10} strokeWidthSecondary={10} color="white" secondaryColor="white"
								wrapperClass={`ml-3 mr-2 opacity-0 transition-[opacity] ${buyNowButtonLoading && "opacity-100"} justify-self-start`} />
							<div className={`absolute flex justify-center items-center group-disabled:opacity-60 transition-[transform,opacity] duration-200 delay-300 ${buyNowButtonLoading && "translate-x-[14px] !delay-[0s]"}`}>
								<PayPalWhiteSVG className="h-4 translate-y-[2px]" />
								<span className="ml-1 font-bold font-paypal leading-none">Express Checkout</span>
							</div>
						</button>
					</div>
				</div>
			</div>
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	try {
		const product = await getProductByID(ctx.params!.pid as string) //eslint-disable-line @typescript-eslint/no-non-null-assertion
		return { props: { product } }
	}
	catch (e) {
		return {
			redirect: {
				destination: "/products",
				permanent: false
			}
		}
	}
}

export default ProductID