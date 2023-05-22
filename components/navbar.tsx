import Link from "next/link";
import { SVGProps, useEffect, useState } from "react"
import { useRouter } from "next/router";

import { AnimatePresence, motion, useScroll } from "framer-motion"
import { useDispatch, useSelector } from "react-redux";

import Price from "components/price";
import LinkBoxes from "components/linkBoxes"

import { OrderProduct } from "types/order";
import { removeFromCart } from "util/redux/cart.slice";
import { logEvent } from "firebase/analytics";
import { analytics } from "util/firebase/analytics";

import { createPayPalOrderLink } from "util/paypal/client/createOrder_client";
import { toast } from "react-toastify";
import { Oval } from "react-loader-spinner";
import { Transition } from "@headlessui/react";

const CartIcon = ({ dim, ...rest }: { dim: number } & SVGProps<SVGSVGElement>) => {
	return (
		<svg {...rest} style={{ width: `${dim}rem`, height: `${dim}rem` }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
			<path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
		</svg>
	)
}

type HamButtonProps = { isOpen: boolean, className?: string, onClick: () => void, id: string }
const HamButton = ({ isOpen, className, onClick, id }: HamButtonProps) => {
	// animations
	const variant = isOpen ? "opened" : "closed";
	const transition = { type: "spring", duration: 0.35 };
	const centerTransition = { ease: "easeOut", duration: transition.duration / 1.5 }
	const top = {
		closed: { rotate: 0, translateY: 0, transition: { delay: 0 } },
		opened: { rotate: 45, translateY: 6, transition: { delay: 0.1 } }
	};
	const center = {
		closed: { x: 0, opacity: 1, transition: { delay: 0.1 } },
		opened: { x: "100%", opacity: 0, transition: { delay: 0 } }
	};
	const bottom = {
		closed: { rotate: 0, translateY: 0, transition: { delay: 0 } },
		opened: { rotate: -45, translateY: -6, transition: { delay: 0.1 } }
	};

	// line properties
	const strokeWidth = 3;
	const lineProps = {
		strokeWidth: strokeWidth as number,
		initial: "closed",
		animate: variant,
	};

	return (
		<motion.svg
			className={`w-12 h-12 ${className}`}
			fill="none" stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			onClick={onClick}
			id={id}
		>
			<motion.path
				variants={top}
				d="M4 6h16"
				{...lineProps}
				transition={transition}
				style={{ originX: '12px', originY: '6px' }}
			/>
			<motion.path
				variants={center}
				d="M4 12h16"
				{...lineProps}
				transition={centerTransition}
				style={{ originX: '12px', originY: '12px' }}
			/>
			<motion.path
				variants={bottom}
				d="M4 18h16"
				{...lineProps}
				transition={transition}
				style={{ originX: '12px', originY: '18px' }}
			/>
		</motion.svg>
	)
}

const CartDropdown = ({ cart, closeCart }: { cart: OrderProduct[], closeCart: () => void }) => {
	const router = useRouter()
	const dispatch = useDispatch()

	const HandleRemoveFromCart = (productInfo: OrderProduct) => {
		dispatch(removeFromCart(productInfo))
	}

	useEffect(() => {
		logEvent(analytics(), "view_item_list")
	}, [])


	const [checkoutLoading, setCheckoutLoading] = useState(false)
	const goToCheckout = async ()=>{
		setCheckoutLoading(true)
		try {
			const { orderID } = await createPayPalOrderLink(cart, false)
			router.push({
				pathname: '/checkout',
				query: { token: orderID },
			})
			closeCart()
		}
		catch (e) {
			toast.error(`Checkout Order Generation Error, see console for more details`, { theme: "colored" })
			console.error(e)
		}
		finally{
			setCheckoutLoading(false)
		}
	}

	return (
		<motion.div
			className="absolute right-0 top-[130%] bg-white min-h-[8rem] min-w-[22rem] rounded-md text-black drop-shadow-md overflow-hidden select-text"
			style={{ backdropFilter: "blur(1rem)" }}
			initial="closed"
			animate="opened"
			exit="closed"
			variants={{
				closed: { y: -5, opacity: 0 },
				opened: { y: 0, opacity: 1 },
			}}
			transition={{ ease: "easeInOut", duration: 0.15 }}
			id="cartDropDown"
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
					cart.length > 0
						? <div>
								{cart.map(p =>
									<div className="flex flex-row items-center p-4 justify-between" key={p.PID}>
										<div className="flex flex-row items-center gap-x-4">
											<img src={p.product?.productImageURL} className="h-10 select-none" alt="Product Image" />
											<p>{p.product?.productName}</p>
										</div>
										<div>
											{
												p.product && p.product?.quantity > 0
													?
													<span> <Price price={p.product?.price} /> x {p.quantity} </span>
													:
													<span>Out of Stock, <span className="underline text-blue-500 hover:cursor-pointer" onClick={() => HandleRemoveFromCart(p)}>remove</span></span>
											}
										</div>
									</div>
								)}
								<div className="flex flex-row w-full justify-around bg-slate-100 p-4 select-none">
									<Link href="/cart" onClick={closeCart}>
										<button className="p-3 px-10 rounded-sm border-2 border-white bg-black font-medium text-white hover:scale-[102%] transition-transform">
											Open Cart
										</button>
									</Link>
									<button className="p-3 px-10 rounded-sm border-2 font-medium text-gray-600 border-gray-300 relative overflow-hidden" onClick={goToCheckout}>
										<div className={"transition-transform " + (!checkoutLoading ? "translate-y-0" : "translate-y-[-150%]")}>
											Checkout
										</div>
										<Transition
											className="absolute left-[50%] translate-x-[-50%] transition-[transform,top]"
											show={checkoutLoading}
											enterFrom="top-[100%] translate-y-0"
											enterTo="top-[50%] translate-y-[-50%]"
											leaveFrom="top-[50%] translate-y-[-50%]"
											leaveTo="top-[100%] translate-y-0"
										>
											<Oval height={20} strokeWidth={10} color="#28a9fa" secondaryColor="#28a9fa"/>
										</Transition>
									</button>
								</div>
							</div>
						: <div className="text-gray-400 text-center pt-4">Cart Empty</div>
				}
			</div>
		</motion.div>
	)
}

const useMenu = (menuIds: string[]): [boolean, (() => void), (() => void)] => {
	const [menuOpen, setMenuOpen] = useState(false)

	// add event listener because event can give information about where the mouse was
	// grouping with toggle only fires when button is clicked (rather than random elements)
	const suppressMenuClose = (e: MouseEvent) => {
		const menuElements = menuIds.map(s => document.getElementById(s))
		const clickingMenuElements = menuElements.some(el => el && el.contains(e.target as HTMLElement))
		if (!clickingMenuElements) setMenuOpen(false)
	}
	useEffect(() => {
		window.addEventListener("click", suppressMenuClose)
		return () => { window.removeEventListener("click", suppressMenuClose) }
	}, []) //eslint-disable-line react-hooks/exhaustive-deps

	const toggleMenuOpen = () => setMenuOpen(e => !e)
	return [menuOpen, toggleMenuOpen, ()=>setMenuOpen(false)]
}

const NavBar = () => {
	const router = useRouter();

	const cart = useSelector((state: { cart: OrderProduct[] }) => state.cart) as OrderProduct[]

	// cart and mobile menus
	const [isMobileMenuOpen, toggleMobileMenuOpen, closeMobileMenu] = useMenu(["mobileMenu", "mobileMenuButton"]);
	const [isCartOpen, toggleCartOpen, closeCart] = useMenu(["cartDropDown", "cartButton"])


	// styling
	const { scrollY } = useScroll();
	const [scrolled, setScrolled] = useState(false)
	useEffect(() => { return scrollY.on("change", (v) => setScrolled(v > 10)) }, [scrollY])
	const inWhiteNavs = ["/", "/order/[pid]", "/products", "/services"].includes(router.pathname)
	const inNoNavbar = ["/checkout", "/admin"].includes(router.pathname)

	return (
		<nav
			className={`fixed top-0 left-0 w-full z-20 select-none
			transition-[background-color,color,translate,box-shadow] delay-[0s,0s,0.7s,0s] duration-200
			${scrolled ? "bg-white shadow-md" : "bg-transparent"} ${!scrolled && inWhiteNavs ? "text-white" : "text-black"}`}
			style={{ translate: `0 ${inNoNavbar ? "-100%" : "0%"}`, }}
		>
			<div className="flex flex-row items-center place-content-between p-2 md:px-6">
				{/* HAM BUTTON + IMAGE */}
				<div className="flex flex-row gap-x-2 z-30">
					<HamButton isOpen={isMobileMenuOpen} className="md:hidden block" onClick={toggleMobileMenuOpen} id="mobileMenuButton" />
					<Link href="/" className="select-none">
						<img src="/logo.svg" alt="JHY Electrical Logo" className="h-12 pointer-events-none" />
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
				<div className="relative w-[74.63px]">
					<CartIcon dim={2.5} tabIndex={0} id="cartButton" onClick={toggleCartOpen}
						className="hover:cursor-pointer float-right outline-none focus:fill-blue-500 focus:drop-shadow-lg"/>
					{/* BUTTON */}
					<AnimatePresence>
						{
							cart.length > 0 &&
							<motion.span
								className="
						absolute right-[-3px] top-[-3px] w-5 h-5
						bg-red-500 text-white rounded-full leading-none text-[0.65rem] font-bold
						grid place-items-center hover:cursor-pointer"
								animate="open"
								exit="closed"
								variants={{
									"closed": { scale: 0 },
									"open": { scale: 1 }
								}}
								transition={{ type: 'spring', duration: 0.6, bounce: 0.6 }}
							>
								{cart.reduce((a, p) => a + p.quantity, 0)}
							</motion.span>
						}
					</AnimatePresence>

					<AnimatePresence>
						{
							isCartOpen &&
							<CartDropdown cart={cart} closeCart={closeCart} />
						}
					</AnimatePresence>
				</div>
			</div>

			{/* side */}
			<motion.div
				className="fixed z-20 top-0 left-0 h-screen max-w-[32rem] w-full pt-36 bg-white bg-opacity-20 gap-y-4 md:hidden"
				style={{ backdropFilter: "blur(16px)" }}
				animate={isMobileMenuOpen ? "opened" : "closed"} initial="closed"
				variants={{ opened: { x: 0 }, closed: { x: "-100%" } }} transition={{ ease: "easeInOut", duration: 0.4 }}
				id="mobileMenu"
			>
				<LinkBoxes onClick={closeMobileMenu} />
			</motion.div>
		</nav>
	)
}

export default NavBar;