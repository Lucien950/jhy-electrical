// react
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MouseEventHandler, useEffect, useMemo, useState } from "react"
// redux
import { useDispatch } from "react-redux"
import { removeFromCart } from "util/redux/cart.slice"
// UI
import { Transition } from "@headlessui/react"
import { toast } from "react-toastify"
import { Oval } from "react-loader-spinner"
// util
import { createPayPalOrder } from "app/checkout/paypalClient"
import { OrderProduct } from "types/order"
// components
import Price from "components/price"
// analytics
import { logEvent } from "firebase/analytics"
import { analytics } from "util/firebase/analytics"
import { encodeProductVariantPayPalSku } from "server/paypal/sku"
import { ProductWithVariant } from "types/product"
import { getProductVariant } from "util/product"

const useProduct = (op: OrderProduct) => {
	const [product, setProduct] = useState<ProductWithVariant>()
	const [productLoading, setProductLoading] = useState(true)
	const [productNotFound, setProductNotFound] = useState(false)
	useMemo(() => {
		setProductLoading(true)
		setProductNotFound(false)
		getProductVariant(op.PID, op.variantSKU)
			.then(p => setProduct(p))
			.catch(() => { setProductNotFound(true) })
			.finally(() => { setProductLoading(false) })
	}, [op.PID, op.variantSKU])
	return { product, productLoading, productNotFound }
}

const CartDropDownProductListing = ({ p }: { p: OrderProduct }) => {
	const dispatch = useDispatch()
	const HandleRemoveFromCart: MouseEventHandler<HTMLSpanElement> = (e) => {
		e.preventDefault()
		e.stopPropagation()
		dispatch(removeFromCart(p.PID))
	}
	const { product, productLoading, productNotFound } = useProduct(p)

	if (productNotFound) {
		return (
			<div>
				<p>
					<code className="bg-slate-300 p-1 rounded-sm text-sm">{p.PID}</code> not found: <span className="link" onClick={HandleRemoveFromCart}>Remove?</span>
				</p>
			</div>
		)
	}

	return (
		<div className="flex flex-row items-center justify-between">
			<div className="flex flex-row items-center gap-x-4 flex-1">
				<div className="h-10 w-12">
					{
						productLoading || !product
						? <div className="h-full w-full bg-gray-200 animate-pulse" />
						: <img src={product.productImageURL} className="w-full h-full object-cover select-none" alt="Product Image" />
					}
				</div>
				{
					productLoading || !product
					?
					<div className="w-1/2 self-start">
						<div className="h-3 bg-gray-200 animate-pulse mb-1" />
						<div className="h-3 bg-gray-200 animate-pulse" />
					</div>
					: <p>{product.productName}</p>
				}
			</div>
			{
				!productLoading && product &&
				<div>
					{
						product.quantity > 0
							? <span> <Price price={product.price} /> x {p.quantity} </span>
							:
							<span>Out of Stock,
								<span className="underline text-blue-500 hover:cursor-pointer" onClick={HandleRemoveFromCart}>
									remove
								</span>
							</span>
					}
				</div>
			}
		</div>
	)
}

export const CartDropdown = ({ cart, closeCart, isCartOpen }: {
	cart: OrderProduct[], closeCart: () => void, isCartOpen: boolean
}) => {
	const router = useRouter()
	useEffect(() => { logEvent(analytics(), "view_item_list") }, [])

	const [checkoutLoading, setCheckoutLoading] = useState(false)
	const goToCheckout = async () => {
		setCheckoutLoading(true)
		try {
			const { orderID } = await createPayPalOrder(cart, false)
			router.push(`/checkout?token=${orderID}`)
			closeCart()
		}
		catch (e) { toast.error((e as Error).message, { theme: "colored" }) }
		finally { setCheckoutLoading(false) }
	}

	return (
		<div
			className={`absolute right-0 top-[140%] min-h-[8rem] min-w-[22rem]
			invisible opacity-0 translate-y-2 data-[iscartopen=true]:visible data-[iscartopen=true]:translate-y-0 data-[iscartopen=true]:opacity-100
			bg-white text-black drop-shadow-md rounded-md overflow-hidden select-text [&>*]:p-4 transition-all duration-200`}
			id="cartDropDown" data-iscartopen={isCartOpen}
		>
			<div className="flex flex-row items-center gap-x-3">
				<h1 className="text-xl font-medium">Cart</h1>
				<p className="rounded-full bg-slate-300 text-gray-500 w-6 h-6 grid place-items-center font-bold">{cart.length}</p>
			</div>
			<hr className="!p-0" />
			{cart.length <= 0
				? <div className="text-gray-400 text-center">Cart Empty</div>
				:
				<>
					{cart.map(p => <CartDropDownProductListing p={p} key={encodeProductVariantPayPalSku(p.PID, p.variantSKU)} />)}
					{/* bottom buttons */}
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
		</div>
	)
}