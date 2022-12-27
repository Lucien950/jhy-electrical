import Link from "next/link";
import { useRef, useState } from "react"

import { AnimatePresence, motion, useScroll } from "framer-motion"
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { productInfo } from "../types/order";

type cartProps = { dim: number, className?: string }
const Cart = ({ dim, className }: cartProps) => {
	return(
		<svg className={className} style={{width: `${dim}rem`, height: `${dim}rem`}} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
			<path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
		</svg>
	)
}

type HamButtonProps = { isOpen: Boolean, className?: string, onClick: ()=>void }
const HamButton = ({isOpen, className, onClick}: HamButtonProps)=>{
	// animations
	const variant = isOpen ? "opened" : "closed";
	const transition = { type: "spring", duration: 0.35 };
	const centerTransition = { ease: "easeOut", duration: transition.duration/1.5 }
	const top = {
		closed: { rotate: 0, translateY: 0, transition:{delay:0} },
		opened: { rotate: 45, translateY: 6, transition:{delay:0.1} }
	};
	const center = {
		closed: { x: 0, opacity:1, transition: {delay:0.1}},
		opened: { x: "100%", opacity:0, transition: {delay:0} }
	};
	const bottom = {
		closed: { rotate: 0, translateY: 0, transition:{delay:0} },
		opened: { rotate: -45, translateY: -6, transition:{delay:0.1} }
	};

	// line properties
	const strokeWidth = 3;
	const lineProps = {
		stroke: "black",
		strokeWidth: strokeWidth as number,
		initial: "closed",
		animate: variant,
	};
	
	return (
		<motion.svg
			className = {`w-12 h-12 ${className}`}
			fill="none" stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			onClick = { onClick }
		>
			<motion.path
				variants={top}
				d="M4 6h16"
				strokeLinejoin="round" strokeLinecap="round"
				{...lineProps}
				transition={transition}
				style={{ originX: '60%', originY: '50%' }}
			/>
			<motion.path
				variants={center}
				d="M4 12h16"
				strokeLinejoin="round" strokeLinecap="round"
				{...lineProps}
				transition={centerTransition}
				style={{ originX: '60%', originY: '50%' }}
			/>
			<motion.path
				variants={bottom}
				d="M4 18h16"
				strokeLinejoin="round" strokeLinecap="round"
				{...lineProps}
				transition={transition}
				style={{ originX: '60%', originY: '50%' }}
			/>
		</motion.svg>
	)
}

const NavBar = () => {
	const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { scrollY } = useScroll();
	const router = useRouter();
	const whiteBG = useRef(null)
	const cart = useSelector((state: { cart: productInfo[] }) => state.cart) as productInfo[]

	scrollY.onChange(v=>{
		(whiteBG.current! as HTMLDivElement).style.backgroundColor = (v>10) ? "white" : "transparent";
		(whiteBG.current! as HTMLDivElement).style.color = (v > 10) ? "black" : "";
	})
	const toggleSetMobileMenuOpen = ()=>{setMobileMenuOpen(e => !e)}

	return (
	<>
	{/* top row */}
	<div
				className={`flex flex-row items-center place-content-between fixed top-0 left-0 w-full p-2 z-20 select-none will-change-transform transition-[colors_transform] duration-200 ${router.pathname == "/" ? "text-white" : ""} ${router.pathname == "/checkout/[pid]" ? "translate-y-[-100%]" : ""}`}
		ref={whiteBG}
	>
		<Link href="/" className="select-none">
			<img src="/logo.svg" alt="JHY Electrical Logo" className="h-12 pointer-events-none"/>
		</Link>

		<div className="hidden md:flex md:flex-row md:gap-14 font-bold text-lg">
			<Link href="/products">
				PRODUCTS
			</Link>
			<Link href="/services">
				SERVICES
			</Link>
		</div>
		<Link href="/cart">
			<div className="relative">
				<Cart dim={2.5} className="hidden md:block"/>
				<AnimatePresence>
					{
						cart.length > 0 &&
						<motion.span
							className="
							absolute left-[-8px] bottom-[-7px] w-5 h-5
							bg-red-400 text-white rounded-full leading-none text-sm font-bold
							grid place-items-center"
							animate="open"
							exit="closed"
							variants={{
								"closed":{scale: 0},
								"open":{scale: 1}
							}}
							transition={{ type: 'spring', duration: 0.6, bounce: 0.6 }}
						>
							{cart.length}
						</motion.span>
					}
				</AnimatePresence>
			</div>
		</Link>
		<HamButton isOpen={isMobileMenuOpen} className="md:hidden block" onClick={toggleSetMobileMenuOpen}/>
	</div>
	{/* side */}
	<motion.div
		className="
			fixed right-0 top-0 h-full w-1/2 z-10
			px-4 pt-36
			bg-white bg-opacity-20
			flex flex-col gap-y-4
			text-3xl font-bold"
		style={{backdropFilter: "blur(1rem)"}}
		animate={isMobileMenuOpen ? "opened" : "closed"}
		initial="closed"
		variants={{
			opened:{x:0},
			closed:{x:"100%"}
		}}
		transition={{ease: "easeInOut", duration: 0.4}}
	>
		<Link href="/products" onClick={toggleSetMobileMenuOpen}> PRODUCTS </Link>
		<Link href="/services" onClick={toggleSetMobileMenuOpen}> SERVICES </Link>
		<Link href="/cart" onClick={toggleSetMobileMenuOpen}>CART</Link>
	</motion.div>
	</>
)}

export default NavBar;