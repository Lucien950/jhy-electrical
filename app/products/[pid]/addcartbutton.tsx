"use client"

import { motion } from 'framer-motion';
import { useState } from 'react';

type AddCartButtonProps = { has_stock: boolean, soldOut: boolean, handleAddToCart: () => void }
export const AddCartButton = ({ has_stock: available, soldOut: selectedQuantZero, handleAddToCart }: AddCartButtonProps) => {
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

	return (
		<button
			onClick={() => {
				animateCart()
				handleAddToCart()
			}}
			className={`w-full border-2 p-2 px-4 relative overflow-clip
				bg-white text-blue-600 border-blue-600
				transition-transform hover:scale-[102%] active:scale-90
				disabled:scale-100 ${animating ? "" : "disabled:text-blue-300 disabled:border-blue-300"}`}
			disabled={animating || !available || selectedQuantZero}
		>
			{
				available || animating
					?
					<>
						{/* DEFAULT VIEW */}
						<div
							className="relative transition-all duration-200 left-[50%] translate-x-[-50%]"
							style={{
								transitionProperty: "opacity, scale",
								scale: animating ? "0" : "1",
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
