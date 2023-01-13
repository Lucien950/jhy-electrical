// react
import { MouseEventHandler, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
// redux
import { useSelector, useDispatch } from "react-redux"
import { removeFromCart, setQuantity } from "util/redux/cart.slice";
// products
import { productInfo } from "types/order";
// ui
import Price from "components/price";
import { PaypalSVG } from "components/paypalSVG";
import { getUserPostcode } from "util/postalCode";
import { calculateShipping } from "util/calculateShipping";
import Tippy from "@tippyjs/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { Oval } from "react-loader-spinner";
import { createOrder } from "util/paypal/createOrder";

const ProductListing = ({ productInfo }: { productInfo:productInfo})=>{
	const product = productInfo.product
	const dispatch = useDispatch()

	if(!product){
		return(
			<div className="h-20 bg-red-500 p-4 border-2 border-red-900 text-white font-bold grid place-items-center">
				<h1>ERROR: NO PRODUCT ASSOCIATED TO PRODUCTINFO OBJECT</h1>
			</div>
		)
	}
	const handleUpdateQuantity = (change: number)=>{
		let quantity = productInfo.quantity + change
		quantity = Math.min(quantity, product.quantity)
		quantity = Math.max(1, quantity)
		dispatch(setQuantity({PID: productInfo.PID, quantity}))
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
					<span className="text-sm underline text-blue-500 hover:cursor-pointer" onClick={() => dispatch(removeFromCart(productInfo))}>
						Remove from Cart
					</span>
				</div>
				<p className="text-gray-600 text-xs">{product.description}</p>
			</div>
			<div className="justify-self-end flex flex-col justify-between items-end flex-[2_2_29%]">
				<div>
					<Price price={product.price * productInfo.quantity}/>
				</div>
				{
					product.quantity > 0 &&
						<div className="flex flex-row border-2 mt-3">
							<button className="w-10 h-10 grid place-items-center disabled:text-gray-300" disabled={productInfo.quantity - 1 < 1} onClick={()=>handleUpdateQuantity(-1)}>
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
							</button>
							<span className="w-10 h-10 grid place-items-center">{productInfo.quantity}</span>
							<button className="w-10 h-10 grid place-items-center disabled:text-gray-300" disabled={productInfo.quantity + 1 > product.quantity} onClick={()=>handleUpdateQuantity(1)}>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
							</button>
						</div>
				}
			</div>
		</div>
	)
}

const CostLoader = ( <Oval height={18} width={18} strokeWidth={6} strokeWidthSecondary={6} color="#28a9fa" secondaryColor="#28a9fa"/> )

export default function Cart() {
	const router = useRouter()
	const cart = useSelector((state: { cart: productInfo[] })=>state.cart) as productInfo[]

	const [shippingCost, setShippingCost] = useState(-1)
	const [productShippingCosts, setProductShippingCosts] = useState({} as {[key: string]: number})
	const [subTotal, setSubTotal] = useState(-1)
	const [total, setTotal] = useState(-1)
	const [tax, setTax] = useState(0.13)

	const [paypalLoading, setPaypalLoading] = useState(false)

	// update the products and estimate shipping cost
	useEffect(() => {
		if (router.query) {
			router.push("/cart", undefined, { shallow: true })
		}
		getUserPostcode()
			.then(postalCode => {
				if(!postalCode) throw "No Postal Code"
				return calculateShipping(cart, postalCode)
			})
			.then(res =>{
				setProductShippingCosts(res)
			})
			.catch(e=>{
				console.error(e)
			})
	}, [])

	// set shipping costs
	useEffect(()=>{
		setShippingCost(cart.reduce((a, p)=>a + productShippingCosts[p.PID] * p.quantity, 0))
	}, [productShippingCosts, cart])
	// set subtotal
	useEffect(()=>{
		setSubTotal(cart.reduce((a: number, p) => a + (p.product?.price || 0) * p.quantity, 0))
	},[cart])
	// set tax
	useEffect(()=>{
		setTax((subTotal + shippingCost) * 0.13)
	}, [subTotal, shippingCost])
	// set total
	useEffect(()=>{
		setTotal(subTotal + shippingCost + tax)
	}, [subTotal, shippingCost, tax])

	const paypalCheckout: MouseEventHandler<HTMLButtonElement> = async (e) => {
		setPaypalLoading(true)
		const redirect_link = await createOrder(total).catch(err=>{
			console.error(err)
		})
		if(!redirect_link){
			setPaypalLoading(false)
			return
		}
		router.push(redirect_link)
	}

	return (
		<>
		<Head>
			<title>Cart | JHY Electrical</title>
		</Head>
		<div className="pt-24 pb-10 2xl:px-64 min-h-screen container mx-auto">
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
							{cart.map(productInfo => <ProductListing productInfo={productInfo} key={productInfo.PID} />)}
						</div>
						</>
					}
				</div>
				
				{/* Price information */}
				{
				cart.length > 0 &&
				<div className="w-full md:flex-[1] sticky top-[5rem] self-start">
					{/* blackbox */}
					<div className="p-6 bg-black text-white">
						<h1 className="text-3xl font-bold">Your Cart</h1>
						<hr className="my-4"/>

						<div className="flex flex-row mb-4">
							<p className="flex-1"> Subtotal </p>
							<Price price={subTotal} className="place-self-end"/>
						</div>
						<div className="flex flex-row mb-4">
							<p className="flex flex-row items-center gap-x-2 flex-1">
								<span>
									Estimated Shipping
								</span>
								<Tippy content={"Shipping cost is estimated based on your current position. If you are shipping elsewhere, this value will be inaccurate"} delay={50}>
									<svg className="h-5 w-5 focus:outline-none hover:cursor-pointer" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
										<path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
									</svg>
								</Tippy>
							</p>
							{
								shippingCost ? 
								<Price price={shippingCost} className="place-self-end" />
								:
								CostLoader
							}
						</div>
						<div className="flex flex-row mb-4">
								<p className="flex flex-row items-center gap-x-2 flex-1">
								Tax
								<Tippy content={"Tax is calculated based on the Ontario rate of 13%"} delay={50}>
									<svg className="h-5 w-5 focus:outline-none hover:cursor-pointer" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
										<path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
									</svg>
								</Tippy>
							</p>
							{
								tax ?
								<Price price={tax} className="place-self-end" />
								:
								CostLoader
							}
						</div>
						<div className="flex flex-row mb-8">
							<p className="flex-1">Total</p>
							{
								total ?
								<Price price={total} className="place-self-end" />
								:
								CostLoader
							}
						</div>

						<div className="text-black">
							{/* paypal */}
							<button className="text-lg p-3 w-full h-[50px] bg-white grid place-items-center relative group" onClick={paypalCheckout} disabled={!total}>
								<Oval height={18} width={18} strokeWidth={10} strokeWidthSecondary={10} wrapperClass={`mr-2 opacity-0 transition-[opacity] ${paypalLoading && "opacity-1"}`} color="#28a9fa" secondaryColor="#28a9fa" />
								<div className={`absolute flex justify-center items-center group-disabled:opacity-60 transition-[transform,opacity] duration-200 delay-300 ${paypalLoading && "translate-x-[20px] !delay-[0s]"}`}>
									<PaypalSVG className="h-4 translate-y-[2px]"/>
									<span className="ml-1 font-bold font-paypal leading-none">Express Checkout</span>
								</div>
							</button>	
							{/* checkout */}
							<Link href="/checkout">
							<button className="text-lg my-2 h-[50px] rounded-sm w-full disabled:text-gray-500 bg-white font-bold" disabled={cart.length <= 0}>
								Checkout
							</button>
							</Link>
						</div>
					</div>

					<p className="mt-4 text-gray-600 text-sm">
						TEMPORARY, AND NOT REFLECTIVE OF COMPANY POLICY <br />
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