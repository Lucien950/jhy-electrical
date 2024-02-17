"use client"
// react
import Link from "next/link";
import { Fragment, useEffect, useState } from "react"
import { usePathname } from "next/navigation";
// redux
// import { useSelector } from "react-redux";
// animations
import { AnimatePresence, motion, useScroll } from "framer-motion"
// components
import LinkBoxes from "components/linkBoxes"
import { CartIcon } from "./cartIcon"
import { CartDropdown } from "./cartDropdown";
import { HamButton } from "./hamButton";
// hooks
import { useMenu } from "./useMenu";
import { Transition } from "@headlessui/react";
import { useAppSelector } from "util/redux/hooks";
import { OrderProduct } from "types/order";

export const NavBar = () => {
	const pathName = usePathname();
	const cart: OrderProduct[] = useAppSelector((state: { cart: OrderProduct[] }) => state.cart) as OrderProduct[]
	const cartSize = cart.reduce((a, p) => a + p.quantity, 0)
	// cart and mobile menus
	const [isMobileMenuOpen, toggleMobileMenuOpen, closeMobileMenu] = useMenu(["mobileMenu", "mobileMenuButton"]);
	const [isCartOpen, toggleCartOpen, closeCart] = useMenu(["cartDropDown", "cartButton"])
	// styling
	const { scrollY } = useScroll();
	const [scrolled, setScrolled] = useState(false)
	useEffect(() => { return scrollY.on("change", (v) => setScrolled(v > 10)) }, [scrollY])
	const inWhiteNavs = ["/", "/order/[pid]", "/products", "/services"].includes(pathName)
	const inNoNavbar = ["/checkout", "/admin"].includes(pathName)

	return (
		<>
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
						<Link href="/">
							<img src="/logo.svg" alt="JHY Electrical Logo" className="h-12 pointer-events-none" />
						</Link>
					</div>

					{/* MIDDLE LINKS */}
					<div className="hidden md:flex md:flex-row md:gap-14 font-bold text-lg z-30">
						<Link href="/products"> Products </Link>
						<Link href="/services"> Services </Link>
					</div>

					{/* CART */}
					<div className="relative w-[74.63px]">
						<CartIcon dim={2.5} tabIndex={0} id="cartButton" onClick={toggleCartOpen}
							className="hover:cursor-pointer float-right outline-none focus:fill-blue-500 focus:drop-shadow-lg" />
						{/* Cart Size Icon */}
						<Transition
							show={cart.length > 0}
							enterFrom="scale-0" enterTo="scale-100"
							leaveFrom="scale-100" leaveTo="scale-0"
							as={Fragment}
						>
							<span
								className="absolute right-[-3px] top-[-3px] w-5 h-5 transition-transform
									bg-red-500 text-white rounded-full leading-none text-[0.65rem] font-bold
										grid place-items-center hover:cursor-pointer"
							>
								{cartSize}
							</span>
						</Transition>

						<AnimatePresence>
							{isCartOpen && <CartDropdown cart={cart} closeCart={closeCart} />}
						</AnimatePresence>
					</div>
				</div>
			</nav>
			{/* side */}
			<motion.div
				className="
					fixed z-20 top-0 left-0 px-2 grid place-items-center
					h-screen max-w-[32rem] w-full md:hidden
					bg-white bg-opacity-20 backdrop-blur-lg"
				animate={isMobileMenuOpen ? "opened" : "closed"} initial="closed"
				variants={{ opened: { x: 0 }, closed: { x: "-100%" } }}
				transition={{ ease: "easeInOut", duration: 0.4 }}
				id="mobileMenu"
			>
				<div className="w-full">
					<LinkBoxes onClick={closeMobileMenu} />
				</div>
			</motion.div>
		</>
	)
}