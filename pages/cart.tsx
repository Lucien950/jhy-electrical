import Price from "../components/price";

import { useSelector, useDispatch } from "react-redux"
import { cartFillProducts, clearCart, removeFromCart, setQuantity } from "../util/redux/cart.slice";
import { useEffect, useRef } from "react";

import { productInfo } from "../types/order";
import { getProductsByIDs} from "../util/fillProduct";
import Head from "next/head";
import Link from "next/link";

const ProductListing = ({ productInfo }: { productInfo:productInfo})=>{
	const product = productInfo.product
	const dispatch = useDispatch()
	const quantityRef = useRef(null)

	if(!product){
		return(
			<div className="h-20 bg-red-500 p-4 border-2 border-red-900 text-white font-bold grid place-items-center">
				<h1>ERROR: NO PRODUCT ASSOCIATED TO PRODUCTINFO OBJECT</h1>
			</div>
		)
	}
	const handleUpdateQuantity = ()=>{
		if (quantityRef.current == null) return
		let quantity = parseInt((quantityRef.current as HTMLInputElement).value)
		if(quantity == 0){
			dispatch(removeFromCart({PID: productInfo.PID}))
			return
		}
		quantity = Math.min(quantity, product.quantity)
		quantity = Math.max(1, quantity)

		;(quantityRef.current as HTMLInputElement).value = quantity.toString()
		dispatch(setQuantity({PID: productInfo.PID, quantity}))
	}

	return(
		<div className="p-4 border-2 bg-slate-200 rounded-lg grid grid-cols-6">
			<img src={product.productImageURL} alt="Product Image" className="h-14 self-center"/>
			<div className="col-span-4">
				<h1 className="font-medium text-lg">
					{product.productName}
				</h1>
				{product.quantity > 0
					? <p className="text-sm text-green-600">In Stock</p>
					: <p className="text-sm text-red-700">Out of Stock</p>
				}
				{
					product.quantity > 0
					?
					<div className="flex flex-row gap-x-1 items-center">
						<input type="text" className="w-12 p-1 rounded-lg border-2 focus:ring-2 outline-none" defaultValue={productInfo.quantity} ref={quantityRef}/>
						<button className="border-2 p-2 rounded-xl bg-blue-200 text-xs" onClick={handleUpdateQuantity}>Update</button>
					</div>
					:
					<div className="underline text-blue-500 hover:cursor-pointer" onClick={() => dispatch(removeFromCart(productInfo))}>Remove from Cart</div>
				}
			</div>
			<Price price={product.price * productInfo.quantity} className="justify-self-end"/>
		</div>
	)
}

const Cart = () => {
	const dispatch = useDispatch()
	const cart = useSelector((state: { cart: productInfo[] })=>state.cart) as productInfo[]
	const handleClearCart = () => {
		dispatch(clearCart())
	}

	// update the products
	useEffect(() => {
		getProductsByIDs(cart.map(p => p.PID))
			.then(requiredProducts => {
				dispatch(cartFillProducts(requiredProducts))
			})
	}, [])

	return (
		<>
		<Head>
			<title>Cart | JHY Electrical</title>
		</Head>
		<div className="bg-gray-100 pt-20 min-h-screen">
			<div className="gap-x-4 flex flex-col md:flex-row gap-y-4 container mx-auto">
				{/* CART */}
				<div className="bg-white p-4 md:flex-[3_3_75%]">
					<h1 className="text-4xl font-bold mb-4">Cart</h1>
					{
						cart.length == 0 ? 
						<div>
							<h1 className="font-medium text-gray-400 text-xl text-center">Cart is empty</h1>
						</div>
						:
						<>
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
				<div className="w-full md:flex-[1_1_25%]">
					<div className="p-4 bg-white">
						<p className="flex flex-row items-center">
							Subtotal: ${(cart.reduce((a: number, p) => a + (p.product?.price || 0) * p.quantity, 0)).toFixed(2)}
						</p>
						<Link href="/checkout">
						<button className="p-2 border-2 rounded-md w-full disabled:text-gray-500" disabled={cart.length <= 0}>
							Checkout
						</button>
						</Link>
						<button className="p-2 border-2 rounded-md w-full disabled:text-gray-500" onClick={handleClearCart} disabled={cart.length <= 0}>
							Clear Cart
						</button>
					</div>
				</div>
			</div>
		</div>
		</>
	);
}

export default Cart;