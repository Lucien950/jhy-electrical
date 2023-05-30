// react
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
// redux
import { useDispatch } from "react-redux"
import { removeFromCart } from "util/redux/cart.slice"
// UI
import { Transition } from "@headlessui/react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Oval } from "react-loader-spinner"
// util
import { createPayPalOrder } from "util/paypal/createOrder_client"
// types
import { OrderProduct } from "types/order"
// components
import Price from "components/price"
// analytics
import { logEvent } from "firebase/analytics"
import { analytics } from "util/firebase/analytics"

export const CartDropdown = ({ cart, closeCart }: { cart: OrderProduct[], closeCart: () => void }) => {
	const router = useRouter()
	const dispatch = useDispatch()

	const HandleRemoveFromCart = (productInfo: OrderProduct) => {
		dispatch(removeFromCart(productInfo))
	}

	useEffect(() => {
		logEvent(analytics(), "view_item_list")
	}, [])


	const [checkoutLoading, setCheckoutLoading] = useState(false)
	const goToCheckout = async () => {
		setCheckoutLoading(true)
		try {
			const { orderID } = await createPayPalOrder(cart, false)
			router.push({
				pathname: '/checkout',
				query: { token: orderID },
			})
			closeCart()
		}
		catch (e) {
			toast.error(`Checkout Order Generation Error, see console for more details`, { theme: "colored" })
		}
		finally {
			setCheckoutLoading(false)
		}
	}

	return (
		<motion.div
			className="absolute right-0 top-[130%] min-h-[8rem] min-w-[22rem]
			bg-white text-black drop-shadow-md rounded-md overflow-hidden select-text [&>*]:p-4"
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
			<div className="flex flex-row items-center gap-x-3">
				<h1 className="text-xl font-medium">Cart</h1>
				<p className="rounded-full bg-slate-300 text-gray-500 w-6 h-6 grid place-items-center font-bold">{cart.length}</p>
			</div>
			<hr className="!p-0"/>
			{cart.length <= 0
				? <div className="text-gray-400 text-center">Cart Empty</div>
				:
				<>
					{cart.map(p => (
						<div key={p.PID}>
							{
								!p.product
									? <div> <p> <code className="bg-slate-300 p-1 rounded-sm text-sm">{p.PID}</code> 	not found: <span className="link">Remove?</span> </p> </div>
									:
									<div className="flex flex-row items-center justify-between">
										<div className="flex flex-row items-center gap-x-4">
											<div className="h-10 w-12">
												<img src={p.product.productImageURL} className="w-full h-full object-cover select-none" alt="Product Image" />
											</div>
											<p>{p.product.productName}</p>
										</div>
										<div>
											{
												p.product.quantity > 0
													? <span> <Price price={p.product?.price} /> x {p.quantity} </span>
													: <span>Out of Stock, <span className="underline text-blue-500 hover:cursor-pointer" onClick={() => HandleRemoveFromCart(p)}>remove</span></span>
											}
										</div>
									</div>
							}
						</div>
					))}
					<div className="flex flex-row w-full justify-around bg-slate-100 select-none">
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
								enterFrom="top-[100%] translate-y-0" enterTo="top-[50%] translate-y-[-50%]"
								leaveFrom="top-[50%] translate-y-[-50%]" leaveTo="top-[100%] translate-y-0"
							>
								<Oval height={20} strokeWidth={10} color="#28a9fa" secondaryColor="#28a9fa" />
							</Transition>
						</button>
					</div>
				</>
			}
		</motion.div>
	)
}