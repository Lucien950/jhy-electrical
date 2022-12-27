import { GetServerSideProps } from 'next'
import { getProductByID } from '../../util/fillProduct'
import productType from '../../types/product'
import { residential, commercial, industrial } from '../../components/categoryIcons'

import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../../util/redux/cart.slice';
import Price from '../../components/price'
import { productInfo } from '../../types/order';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AddCartButton = ({ buttonFunction, inCart, inCartLoaded }: { buttonFunction: () => void, inCart: boolean, inCartLoaded : boolean})=>{
	const [animating, setAnimating] = useState(false)
	const animationDuration = 1.8 // time in seconds
	const fallingEdgeAnimationDuration = 0.2
	const handleCartButtonClick = ()=>{
		buttonFunction()
		setAnimating(true)
		setTimeout(()=>{
			setAnimating(false)
		}, inCart ? fallingEdgeAnimationDuration*1000 : animationDuration*1000)
	}

	return(
		<button
			onClick={ handleCartButtonClick }
			className={`border-2 p-2 px-4 relative rounded-full bg-white overflow-hidden transition-transform will-change-transform ${!inCart ? "hover:scale-110 active:scale-90 relative" : ""}`}
			disabled={animating}	
		>
			<div
				className="relative transition-all duration-200"
				style={{
					transform: `scale(${inCart ? 0 : 1})`,
					opacity: inCart ? "0" : "1",
					transitionDelay: inCart ? "" : "0.15s"
				}}
			>
				<div className="flex flex-row items-center gap-x-1 font-bold">
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
					Add to Cart
				</div>
			</div>
			
			{
				(inCart || !inCartLoaded) &&
				<motion.svg
					className="w-6 h-6 absolute top-2 right-full"
					animate={{left: ["-9%", "50%", "50%", "109%"], rotate: [-16, 0, 0, -16], x:"-50%"}}
					transition={{
						duration: animationDuration,
						times: [0, 0.4, 0.6, 1],
						left:{
							duration: animationDuration,
							times: [0, 0.4, 0.6, 1],
							ease: [0.545, -0.195, 0.235, 0.990]
						}
					}}
					initial={false}
					fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
				</motion.svg>					
			}
			<div
				className="absolute transition-all left-[50%] top-2 duration-200"
				style={{
					transitionDelay: inCart && animating ? `${animationDuration}s` : "",
					opacity: inCart ? "1" : "0",
					transform: `translate(-50%, ${inCart ? 0 : 12}px)`
				}}
			>
				Added
			</div>
		</button>
	)
}

const ProductID = ({product}: {product: productType}) => {
	const dispatch = useDispatch()
	const cart = useSelector((state: { cart: productInfo[] }) => state.cart) as productInfo[]
	const [inCart, setInCart] = useState(false)
	const [inCartLoaded, setInCartLoaded] = useState(false)
	useEffect(() => {
		setInCart(cart.find(p => p.PID == product.firestoreID) != undefined)
		setInCartLoaded(true)
	}, [cart])

	const addCart = ()=>{
		if(inCart){
			dispatch(removeFromCart({PID:product.firestoreID}))
			return
		}
		if(product.quantity > 0){
			dispatch(addToCart({PID:product.firestoreID}))
		} else{
			console.error("No more stock")
		}
	}

	return (
		<div className="grid grid-cols-2 mx-10 mt-20">
			<div>
				<img src={product.productImageURL} className="w-full" alt="" />
			</div>
			<div>
				<div className="p-4">
					<h1 className="font-bold text-3xl mb-2">{product.productName}</h1>
					<hr />
					<Price price={product.price} />
					<h2 className="text-2xl">About this item</h2>
					<p>{product.description}</p>
					<div className="flex flex-row">
						{product.residential && residential}
						{product.commercial && commercial}
						{product.industrial && industrial}
					</div>

					<p>{product.quantity} in stock</p>
					<AddCartButton buttonFunction={addCart} inCart={inCart} inCartLoaded={inCartLoaded}/>
				</div>
			</div>
		</div>
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