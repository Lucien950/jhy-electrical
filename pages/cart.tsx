// react
import { MouseEventHandler, useEffect, useState } from "react";
import Head from "next/head";
// redux
import { useSelector, useDispatch } from "react-redux"
import { removeFromCart, setQuantity } from "util/redux/cart.slice";
// products
import { OrderProduct } from "types/order";
// ui
import Price from "components/price";
import { PaypalSVG } from "components/paypalSVG";
import Tippy from "@tippyjs/react";
import { useRouter } from "next/router";
import { Oval } from "react-loader-spinner";
import { createPayPalOrderLink } from "util/paypal/createOrderClient";
import { logEvent } from "firebase/analytics";
import { analytics } from "util/firebase/analytics";
import { toast } from "react-toastify";
// util price
import { PriceInterface, TAX_RATE } from "util/priceUtil";

const ProductListing = ({ orderProduct }: { orderProduct: OrderProduct})=>{
	const product = orderProduct.product
	const dispatch = useDispatch()

	if(!product){
		return(
			<div className="h-20 bg-red-500 p-4 border-2 border-red-900 text-white font-bold grid place-items-center">
				<h1>ERROR: NO PRODUCT ASSOCIATED TO PRODUCTINFO OBJECT</h1>
			</div>
		)
	}
	const handleUpdateQuantity = (change: number)=>{
		let quantity = orderProduct.quantity + change
		quantity = Math.min(quantity, product.quantity)
		quantity = Math.max(1, quantity)
		dispatch(setQuantity({PID: orderProduct.PID, quantity}))
	}

	return(
		<div className="p-4 flex flex-row gap-x-2">
			<div className='flex-[1_0_3.5rem] grid place-items-center'>
				<img src={product.productImageURL} alt="Product Image" className="h-14"/>
			</div>
			<div className="flex-[4_4_57%]">
				<h1 className="font-medium text-lg">
					{product.productName}
				</h1>
				<div className='flex flex-row items-center gap-x-2'>
					{product.quantity > 0
						? <p className="text-sm text-green-600">In Stock</p>
						: <p className="text-sm text-red-700">Out of Stock</p>
					}
					<span
						className="text-sm underline text-blue-500 hover:cursor-pointer"
						onClick={() => {
							logEvent(analytics(), "remove_from_cart", { items: [{ item_id: product.productName, price: product.price, quantity: product.quantity }] })
							dispatch(removeFromCart(orderProduct))
						}}
					>
						Remove from Cart
					</span>
				</div>
				<p className="text-gray-600 text-xs">{product.description}</p>
			</div>
			<div className="justify-self-end flex flex-col justify-between items-end flex-[2_2_29%]">
				<div>
					<Price price={product.price * orderProduct.quantity}/>
				</div>
				{
					product.quantity > 0 &&
						<div className="flex flex-row border-2 mt-3">
							<button className="w-10 h-10 grid place-items-center disabled:text-gray-300" disabled={orderProduct.quantity - 1 < 1} onClick={()=>handleUpdateQuantity(-1)}>
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
							</button>
							<span className="w-10 h-10 grid place-items-center">{orderProduct.quantity}</span>
							<button className="w-10 h-10 grid place-items-center disabled:text-gray-300" disabled={orderProduct.quantity + 1 > product.quantity} onClick={()=>handleUpdateQuantity(1)}>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
							</button>
						</div>
				}
			</div>
		</div>
	)
}

const CostLoader = ( <Oval height={18} width={18} strokeWidth={6} strokeWidthSecondary={6} color="#28a9fa" secondaryColor="#28a9fa"/> )


const usePrice = (cart: OrderProduct[])=>{
	const [subtotal, setSubtotal] = useState(0)
	const [tax, setTax] = useState(0)
	const [total, setTotal] = useState(0)
	// subtotal, tax, shipping, total
	useEffect(() => { setSubtotal(cart.reduce((a: number, p) => a + (p.product?.price || 0) * p.quantity, 0)) }, [cart])
	useEffect(() => { if (subtotal) setTax(subtotal * TAX_RATE) }, [subtotal])
	useEffect(() => { if (subtotal && tax) setTotal(subtotal + tax) }, [subtotal, tax])

	return { paymentInformation: {subtotal, tax, total} as PriceInterface }
}

export default function Cart() {
	const router = useRouter()
	const cart = useSelector((state: { cart: OrderProduct[] })=>state.cart) as OrderProduct[]
	const {paymentInformation: {subtotal, tax, total}} = usePrice(cart)

	useEffect(() => logEvent(analytics(), "view_cart"), [])
	useEffect(()=>{
		// paypal cancel
		router.push("/cart", undefined, { shallow: true })
		logEvent(analytics(), "cancel_paypal_checkout")
	}, [router.query.token]) // eslint-disable-line react-hooks/exhaustive-deps

	const [paypalLoading, setPaypalLoading] = useState(false)
	const paypalCheckout: MouseEventHandler<HTMLButtonElement> = async () => {
		setPaypalLoading(true)
		try{
			const { redirect_link } = await createPayPalOrderLink(cart, "cart")
			if(!redirect_link){
				toast.error("Redirect Link could not be found. Please try again")
				return
			}
			router.push(redirect_link)
		}
		catch (e){
			setPaypalLoading(false)
			toast.error(`PayPal Order Link Error, see console for more details`,{theme: "colored"})
			console.error(e)
		}
	}

	const [checkoutLoading, setCheckoutLoading] = useState(false)
	const goToCheckout: MouseEventHandler<HTMLButtonElement> = async () =>{
		setCheckoutLoading(p=>!p)
		try{
			const { orderID } = await createPayPalOrderLink(cart, "checkout")
			router.push({
				pathname: '/checkout',
				query: { token: orderID },
			})
		}
		catch(e){
			setCheckoutLoading(false)
			toast.error(`Checkout Order Generation Error, see console for more details`, { theme: "colored" })
			console.error(e)
		}
	}

	return (
		<>
		<Head>
			<title>Cart | JHY Electrical</title>
		</Head>
		<div className="pt-32 pb-10 2xl:px-36 min-h-screen container mx-auto">
			<h1 className="text-6xl font-bold mb-4">Shopping Cart</h1>
			<div className="gap-x-4 flex flex-col md:flex-row gap-y-4 container mx-auto relative">
				{/* CART */}
				<div className="bg-white md:flex-[2]">
					{
						cart.length == 0 ? 
						<div className="flex items-center justify-center h-full w-full">
							<h1 className="font-medium text-gray-400 text-xl text-center">Cart is empty</h1>
						</div>
						:
						<>
						{/* toprow */}
						<div className="flex flex-row justify-end w-full px-4 font-bold text-lg py-1">
							<div>Price</div>
						</div>
						<div className="flex flex-col gap-y-2">
							{cart.map(productInfo => <ProductListing orderProduct={productInfo} key={productInfo.PID} />)}
						</div>
						</>
					}
				</div>
				
				{/* Price information */}
				{
				cart.length > 0 &&
				<div className="w-full md:flex-[1] sticky top-[5rem] self-start">
					{/* blackbox */}
					<div className="p-6 bg-slate-800 text-white">
						<h1 className="text-3xl font-bold">Your Cart</h1>
						<hr className="my-4"/>

						{/* Subtotal */}
						<div className="flex flex-row mb-4">
							<p className="flex-1"> Subtotal </p>
							<Price price={subtotal} className="place-self-end"/>
						</div>
						{/* Tax */}
						<div className="flex flex-row mb-4">
							<p className="flex flex-row items-center gap-x-2 flex-1">
								Tax
								<Tippy content={"Tax is calculated based on the Ontario rate of 13%"} delay={50}>
									<svg className="h-5 w-5 focus:outline-none hover:cursor-pointer" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
										<path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
									</svg>
								</Tippy>
							</p>
							{ tax ? <Price price={tax} className="place-self-end" /> : CostLoader }
						</div>
						{/* Total */}
						<div className="flex flex-row mb-4">
							<p className="flex-1">Total</p>
							{ total ? <Price price={total} className="place-self-end" /> : CostLoader }
						</div>
						<p className="text-sm mb-6">*Note that this calculation <strong>DOES NOT</strong> take into account shipping fees</p>

						{/* Checkout Buttons */}
						<div className="text-black">
							{/* paypal */}
							<button className="text-lg p-3 w-full h-[50px] bg-white grid place-items-center relative group"
							onClick={paypalCheckout} disabled={!total}>
								<Oval height={18} width={18} strokeWidth={10} strokeWidthSecondary={10} color="#28a9fa" secondaryColor="#28a9fa"
								wrapperClass={`ml-3 mr-2 opacity-0 transition-[opacity] ${paypalLoading && "opacity-100"} justify-self-start`}/>
								<div className={`absolute flex justify-center items-center group-disabled:opacity-60 transition-[transform,opacity] duration-200 delay-300 ${paypalLoading && "translate-x-[14px] !delay-[0s]"}`}>
									<PaypalSVG className="h-4 translate-y-[2px]"/>
									<span className="ml-1 font-bold font-paypal leading-none">Express Checkout</span>
								</div>
							</button>	
							{/* checkout */}
							<button className="text-lg my-2 w-full h-[50px] bg-white grid place-items-center relative group"
								disabled={cart.length <= 0} onClick={goToCheckout}>
								<Oval height={18} width={18} strokeWidth={10} strokeWidthSecondary={10} color="black" secondaryColor="black"
									wrapperClass={`ml-3 mr-2 opacity-0 transition-[opacity] ${checkoutLoading && "opacity-100"} left-[25%] absolute`} />
								<span className="group-disabled:text-gray-500 font-bold">
									Checkout
								</span>
							</button>
						</div>
					</div>

					<p className="mt-4 text-gray-600 text-sm">
						**TEMPORARY, AND NOT REFLECTIVE OF COMPANY POLICY <br />
						30 days withdrawal and free returns. Read more about Return and Refund. <br />
						Prices and shipping costs are not confirmed until you&apos;ve reached the checkout <br />
						The items in your shopping bad are saved for 8 days on this computer. We cannot guarantee availability
					</p>
				</div>
				}
			</div>
		</div>
		</>
	);
}