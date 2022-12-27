import Price from "../components/price";

import { useSelector, useDispatch } from "react-redux"
import { cartFillProducts, clearCart, removeFromCart, setQuantity } from "../util/redux/cart.slice";
import { useEffect, useRef, useState } from "react";

import { addDoc, collection, Timestamp } from 'firebase/firestore';
import db from "../util/firebase/firestore"

import { firestoreOrder, productInfo } from "../types/order";
import { getProductsByIDs} from "../util/fillProduct";
import { CircleLoader } from "react-spinners";
import { useRouter } from "next/router";
import Head from "next/head";

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
		<>
		<Head>
			<title>Cart</title>
		</Head>
		<div className="p-4 border-2 bg-slate-200 rounded-lg flex flex-row justify-between">
			<div className="flex flex-row col-span-4 gap-x-2">
				<img src={product.productImageURL} alt="Product Image" className="h-14"/>
				<div>
					<h1 className="font-medium text-lg">
						{product.productName}
					</h1>
					{product.quantity > 0
						? <p className="text-sm text-green-600">In Stock</p>
						: <p className="text-sm text-red-700">Out of Stock</p>
					}
					<div className="flex flex-row gap-x-1 items-center">
						<input type="text" className="w-12 p-1 rounded-lg border-2 focus:ring-2 outline-none" defaultValue={productInfo.quantity} ref={quantityRef}/>
						<button className="border-2 p-2 rounded-xl bg-blue-200 text-xs" onClick={handleUpdateQuantity}>Update</button>
					</div>
				</div>
			</div>
			<Price price={product.price * productInfo.quantity}/>
		</div>
		</>
	)
}

const Cart = () => {
	const dispatch = useDispatch()
	const router = useRouter()
	const cart = useSelector((state: { cart: productInfo[] })=>state.cart) as productInfo[]
	const [cartLoading, setCartLoading] = useState(true)
	const handleClearCart = () => {
		dispatch(clearCart())
	}
	const handleCheckout = async ()=>{
		const newOrderDoc = await addDoc(collection(db, "orders"), {
			dateTS: Timestamp.now(),
			products: cart.map(p => { return { PID: p.PID, quantity: p.quantity } }),
			status: "pending",
			orderPrice: cart.reduce((a, p)=>a + p.product!.price, 0) * 100
		} as firestoreOrder)
		router.push(`/checkout/${newOrderDoc.id}`)
	}

	useEffect(()=>{
		getProductsByIDs(cart.map(p=>p.PID))
		.then(requiredProducts =>{
			dispatch(cartFillProducts(requiredProducts))
			setCartLoading(false)
		})
	}, [])

	return (
		<div className="bg-gray-100 pt-20 min-h-screen">
			<div className="mx-24 grid grid-cols-4 gap-x-4 grid-rows-1">
				{/* CART */}
				<div className="col-span-3 bg-white p-4">
					<h1 className="text-4xl font-bold mb-4">Cart</h1>
					<div className="flex flex-row justify-end w-full px-4 font-bold text-lg py-1">
						<div>Price</div>
					</div>
					{
						cart.length == 0 ? 
						<div>
							<h1 className="font-bold text-3xl">Cart is empty</h1>
						</div>
						:
						(
							cartLoading
							? <CircleLoader />
							:
							<div className="flex flex-col gap-y-2">
								{cart.map(productInfo => <ProductListing productInfo={productInfo} key={productInfo.PID} />)}
							</div>
						)
					}
				</div>
				
				{/* Price information */}
				<div>
					<div className="p-4 bg-white">
						<p className="flex flex-row items-center">
							Subtotal: ${cartLoading ? <CircleLoader /> : (cart.reduce((a: number, p)=>a + (p.product?.price || 0) * p.quantity, 0)).toFixed(2)}
						</p>
						<button className="p-2 border-2 rounded-md w-full disabled:text-gray-500" onClick={handleCheckout} disabled={cart.length <= 0}>Checkout</button>
						<button className="p-2 border-2 rounded-md w-full" onClick={handleClearCart}>Clear Cart</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Cart;