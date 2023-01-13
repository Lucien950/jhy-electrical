import { GetServerSideProps } from 'next'
import { getProductByID } from 'util/fillProduct'
import productType from 'types/product'
import { ResidentialIcon, CommercialIcon, IndustrialIcon } from 'components/categoryIcons'

import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from 'util/redux/cart.slice';
import Price from 'components/price'
import { productInfo } from 'types/order';
import { MouseEventHandler, useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';

const AddCartButton = ({ product, quantity }: {product: productType, quantity: number})=>{
	// HANDLE CART
	const dispatch = useDispatch()
	// ANIMATIONS
	const [animating, setAnimating] = useState(false)
	const animationDuration = 1.8 // time in seconds
	const fallingEdgeAnimationDuration = 1.2

	// ANIMATE + HANDLE CART
	const handleCartButtonClick = ()=>{
		if (product.quantity > 0) {
			dispatch(addToCart({ PID: product.firestoreID, product, quantity }))
		} else {
			console.error("No more stock")
		}
		setAnimating(true)
		setTimeout(()=>{
			setAnimating(false)
		}, animationDuration*1000 + fallingEdgeAnimationDuration * 1000)
	}

	return(
		<button
			onClick={ handleCartButtonClick }
			className={`w-full border-2 p-2 px-4 relative
				bg-white text-blue-600 border-blue-600
				overflow-hidden transition-transform will-change-transform
				${(!animating && product.quantity > 0) && "hover:scale-[102%] active:scale-90"}
				${product.quantity <= 0 && "text-gray-400 disabled:text-blue-300 disabled:border-blue-300"}`}
			disabled={animating || product.quantity <= 0}
		>
			{
				product.quantity > 0
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
							animate={{left: ["-9%", "50%", "50%", "109%"], rotate: [-16, 0, 0, -16], x:"-50%"}}
							transition={{
								duration: animationDuration,
								times: [0.3, 0.4, 0.45, 1],
								left:{
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
				<div>Out of Stock</div>
			}
		</button>
	)
}

const ProductID = ({product}: {product: productType}) => {
	const [quantity, setQuantity] = useState(1)
	const cart = useSelector((state: { cart: productInfo[] }) => state.cart) as productInfo[]
	const buyNow: MouseEventHandler<HTMLButtonElement> = (e) => {
		// TODO Implement this
		return
	}
	return (
		<>
			<Head>
				<title>{product.productName} | JHY Electrical</title>
			</Head>
			<div className="grid grid-cols-1 lg:grid-cols-2 mt-36 container mx-auto px-6 lg:px-36 gap-x-24">
				<div>
					<img src={product.productImageURL} className="w-full" />
				</div>
				<div>
					<div className="p-4">
						{/* Basic Information */}
						<h1 className="font-bold text-4xl mb-1">{product.productName}</h1>
						<p className="mb-4 text-lg">{product.description}</p>
						<p className="mb-1 text-lg">{product.quantity} in stock</p>
						<div className="mb-3">
							<Price price={product.price} large/>
						</div>

						{/* Categories */}
						<div className="flex flex-row gap-x-4 mb-3 flex-wrap">
							{product.residential && <div className="flex flex-row items-center gap-x-2">{<ResidentialIcon className="w-10 h-10"/>} Residential</div>}
							{product.commercial && <div className="flex flex-row items-center gap-x-2">{<CommercialIcon className="w-10 h-10"/>} Commercial</div>}
							{product.industrial && <div className="flex flex-row items-center gap-x-2">{<IndustrialIcon className="w-10 h-10"/>} Industrial</div>}
						</div>

						{/* Quantity Adjuster */}
						<div className="flex flex-row items-center gap-x-4 my-4">
							Qty
							<div className="flex flex-row border-2">
								{/* - icon */}
								<button className="w-10 h-10 grid place-items-center disabled:text-gray-300"
									disabled={quantity - 1 < 1} onClick={() => setQuantity(q => Math.max(q - 1, 1))}>
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
										<path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
									</svg>
								</button>
								{/* Quantity */}
								<span className="w-10 h-10 grid place-items-center">{Math.min(quantity, product.quantity)}</span>
								{/* + icon */}
								<button className="w-10 h-10 grid place-items-center disabled:text-gray-300"
									disabled={quantity + 1 > product.quantity - (cart.find(p => p.PID == product.firestoreID)?.quantity || 0)} onClick={() => setQuantity(q => Math.min(q + 1, product.quantity - (cart.find(p=>p.PID == product.firestoreID)?.quantity || 0)))}>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
									</svg>
								</button>
							</div>
						</div>

						{/* Add Cart */}
						<AddCartButton product={product} quantity={quantity}/>
						<button onClick={buyNow} className={`mt-2 p-3 w-full hover:scale-[102%] transition-transform font-bold bg-blue-700 text-white active:scale-[97%] ${product.quantity <= 0 && "disabled:bg-blue-300 disabled:scale-100"}`} disabled={product.quantity <= 0}>
							{product.quantity <= 0 && "Cannot"} Buy Now
						</button>
					</div>
				</div>
			</div>
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	if (!ctx.params?.pid) return {props:{}}
	return {
		props: {
			product: await getProductByID(ctx.params.pid as string)
		}
	}
}

export default ProductID