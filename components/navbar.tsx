import Link from "next/link";
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router";

import { AnimatePresence, motion, useScroll } from "framer-motion"
import { useDispatch, useSelector } from "react-redux";

import Price from "./price";
import { firestoreOrder, productInfo } from "../types/order";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import db from "../util/firebase/firestore"
import { CircleLoader } from "react-spinners";
import { removeFromCart } from "../util/redux/cart.slice";

const Cart = (props: any) => {
const {dim, ...rest} = props
return(
	<svg {...rest} style={{width: `${dim}rem`, height: `${dim}rem`}} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
	</svg>
)}

type HamButtonProps = { isOpen: Boolean, className?: string, onClick: ()=>void, id:string }
const HamButton = ({isOpen, className, onClick, id}: HamButtonProps)=>{
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
			id={id}
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

const CartDropdown = ({ cart, closeCart }: { cart: productInfo[], closeCart: ()=>void })=>{
	const dispatch = useDispatch()
	const HandleRemoveFromCart = (productInfo: productInfo)=>{
		dispatch(removeFromCart(productInfo))
	}

	return(
		<motion.div
			className="absolute right-0 top-[130%] bg-white min-h-[8rem] min-w-[22rem] rounded-md text-black drop-shadow-lg"
			style={{ backdropFilter: "blur(1rem)" }}
			initial="closed"
			animate="opened"
			exit="closed"
			variants={{
				closed: { y: -5, opacity: 0 },
				opened: { y: 0, opacity: 1 },
			}}
			transition={{ ease: "easeInOut", duration: 0.15 }}
			id="cartButton"
		>
			<div className="flex flex-row items-center justify-between p-4">
				<div className="flex flex-row items-center gap-x-3">
					<h1 className="text-xl font-medium">Cart</h1>
					<p className="rounded-full bg-slate-300 text-gray-500 w-6 h-6 grid place-items-center font-bold">{cart.length}</p>
				</div>
			</div>
			<hr />
			<div>
				{
					cart.length > 0 ?
						<div>
							{cart.map(p =>
								<div className="flex flex-row items-center p-4 justify-between" key={p.PID}>
									<div className="flex flex-row items-center gap-x-4">
										<img src={p.product?.productImageURL} className="h-10" alt="Product Image" />
										<p>{p.product?.productName}</p>
									</div>
									<div>
										{
											p.product && p.product?.quantity > 0
											?
											<span>
												<Price price={p.product?.price!} /> x {p.quantity}
											</span>
											:
											<span>Out of Stock, <span className="underline text-blue-500 hover:cursor-pointer" onClick={()=>HandleRemoveFromCart(p)}>remove</span></span>
										}
									</div>
								</div>
							)}
							<div className="flex flex-row w-full justify-around bg-slate-100 p-4">
								<Link href="/cart" onClick={closeCart}>
								<button className="p-3 px-9 rounded-md border-2 font-medium text-gray-500">Edit Cart</button>
								</Link>
								<Link href="/checkout" onClick={closeCart}>
								<button className="p-3 px-9 rounded-md bg-blue-500 font-medium text-white">
									Checkout
								</button>
								</Link>
							</div>
						</div>
						:
						<div className="text-gray-400 text-center pt-4">Cart Empty</div>
				}
			</div>
		</motion.div>
	)
}

const NavBar = () => {
	const router = useRouter();
	
	const { scrollY } = useScroll();
	const whiteBG = useRef(null)
	
	const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [isCartOpen, setCartOpen] = useState(false)
	const cart = useSelector((state: { cart: productInfo[] }) => state.cart) as productInfo[]

	// Close CartDropdown if clicking anywhere other than itself
	const handleCartDropdown = (e: MouseEvent) => {
		const isCartElement = (e as any).path.find((p: HTMLElement) => p.id == "cartButton") != undefined
		if (isCartElement) return
		if(isCartOpen) setCartOpen(false)
	}
	useEffect(()=>{
		window.addEventListener("click", handleCartDropdown)
		
		return ()=>{
			window.removeEventListener("click", handleCartDropdown)
		}
	}, [isCartOpen])

	const handleMobileMenu = (e: MouseEvent)=>{
		const isMobileMenuElement = (e as any).path.find((p: HTMLElement) => p.id == "mobileMenu") != undefined
		if (isMobileMenuElement) return
		if (isMobileMenuOpen) setMobileMenuOpen(false)
	}
	useEffect(()=>{
		window.addEventListener("click", handleMobileMenu)

		return () => {
			window.removeEventListener("click", handleMobileMenu)
		}
	}, [isMobileMenuOpen])

	scrollY.onChange(v=>{
		(whiteBG.current! as HTMLDivElement).style.backgroundColor = (v>10) ? "white" : "transparent";
		(whiteBG.current! as HTMLDivElement).style.color = (v > 10) ? "black" : "";
		(whiteBG.current! as HTMLDivElement).style.boxShadow = (v > 10) ? "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" : "";
	})


	const toggleSetMobileMenuOpen = ()=>setMobileMenuOpen(e => !e)

	return (
	<>
	{/* top row */}
	<nav
		className={`fixed top-0 left-0 w-full z-20 select-none will-change-transform transition-[background-color,color,transform,box-shadow] duration-200 ${["/", "/order/[pid]"].includes(router.pathname) ? "text-white" : ""} ${router.pathname == "/checkout" ? "translate-y-[-100%]" : ""}`}
		ref={whiteBG}
	>
		<div className="flex flex-row items-center place-content-between container mx-auto p-2">
			{/* HAM BUTTON + IMAGE */}
			<div className="flex flex-row gap-x-2 z-30">
				<HamButton isOpen={isMobileMenuOpen} className="md:hidden block" onClick={toggleSetMobileMenuOpen} id="mobileMenu" />
				<Link href="/" className="select-none">
					<img src="/logo.svg" alt="JHY Electrical Logo" className="h-12 pointer-events-none"/>
				</Link>
			</div>

			{/* MIDDLE LINKS */}
			<div className="hidden md:flex md:flex-row md:gap-14 font-bold text-lg z-30">
				<Link href="/products">
					Products
				</Link>
				<Link href="/services">
					Services
				</Link>
			</div>

			{/* CART */}
			<div className="relative">
				<Cart dim={2.5} onClick={() => setCartOpen(e=>!e)} className="hover:cursor-pointer" id="cartButton"/>
				{/* BUTTON */}
				<AnimatePresence>
					{
						cart.length > 0 &&
						<motion.span
							className="
							absolute right-[-3px] top-[-3px] w-5 h-5
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
							{cart.reduce((a, p)=>a + p.quantity, 0)}
						</motion.span>
					}
				</AnimatePresence>
				
				<AnimatePresence>
					{
						isCartOpen &&
						<CartDropdown cart={cart} closeCart={()=>setCartOpen(false)}/>
					}
				</AnimatePresence>
			</div>
		</div>

		{/* side */}
		<motion.div
			className="
				fixed z-20 top-0 left-0
				h-screen max-w-[32rem] w-full
				px-4 pt-36
				bg-white bg-opacity-20
				flex flex-col gap-y-4
				text-3xl font-bold"
			style={{backdropFilter: "blur(1rem)"}}
			animate={isMobileMenuOpen ? "opened" : "closed"}
			initial="closed"
			variants={{
				opened:{x:0},
				closed:{x:"-100%"}
			}}
			transition={{ease: "easeInOut", duration: 0.4}}
			id="mobileMenu"
		>
			<Link href="/products" onClick={toggleSetMobileMenuOpen}> PRODUCTS </Link>
			<Link href="/services" onClick={toggleSetMobileMenuOpen}> SERVICES </Link>
		</motion.div>
	</nav>
	</>
)}

export default NavBar;