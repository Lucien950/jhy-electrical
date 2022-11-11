import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react"
import { motion } from "framer-motion"

type cartProps = { dim: number, className?: string }
const Cart = ({ dim, className }: cartProps) => {
	return(
		<svg className={`w-${dim} h-${dim} ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
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
				d="M4 6h16M4"
				strokeLinejoin="round" strokeLinecap="round"
				{...lineProps}
				transition={transition}
			/>
			<motion.path
				variants={center}
				d="M4 12h16M4"
				strokeLinejoin="round" strokeLinecap="round"
				{...lineProps}
				transition={centerTransition}
			/>
			<motion.path
				variants={bottom}
				d="M4 18h16"
				strokeLinejoin="round" strokeLinecap="round"
				{...lineProps}
				transition={transition}
			/>
		</motion.svg>
	)
}

const NavBar = () => {
	const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
	const toggleSetMobileMenuOpen = ()=>{setMobileMenuOpen(e => !e)}
	return (
	<>
	{/* top row */}
	<div className="
		flex flex-row items-center place-content-between
		fixed top-0 left-0 w-full
		p-4 z-20
	">
		<Link href="/">
			<img src="logo.svg" alt="JHY Electrical Logo" className="h-12"/>
		</Link>

		<div className="hidden md:flex md:flex-row md:gap-14 font-bold text-xl">
			<Link href="/products">
				Products
			</Link>
			<Link href="/services">
				Services
			</Link>
		</div>
		<Cart dim={8} className="hidden md:block"/>
		<HamButton isOpen={isMobileMenuOpen} className="md:hidden" onClick={toggleSetMobileMenuOpen}/>
	</div>
	{/* side */}
	<motion.div
		className="
			fixed right-0 top-0 h-full w-3/4 z-10
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
		<Link href="/products" onClick={toggleSetMobileMenuOpen}>
			Products
		</Link>
		<Link href="/services" onClick={toggleSetMobileMenuOpen}>
			Services
		</Link>
	</motion.div>
	</>
)}

export default NavBar;