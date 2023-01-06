// react
import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
// redux
import { useSelector, useDispatch } from "react-redux"
import { cartFillProducts, clearCart, removeFromCart, setQuantity } from "util/redux/cart.slice";
// products
import { productInfo } from "types/order";
import { getProductsByIDs} from "util/fillProduct";
// ui
import Price from "components/price";

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
		<div className="p-4 grid grid-cols-7">
			<img src={product.productImageURL} alt="Product Image" className="h-14 place-self-center"/>
			<div className="col-span-4">
				<h1 className="font-medium text-lg">
					{product.productName}
				</h1>
				{product.quantity > 0
					? <p className="text-sm text-green-600">In Stock</p>
					: <p className="text-sm text-red-700">Out of Stock</p>
				}
				<p className="text-gray-600 text-sm">{product.description}</p>
			</div>
			<div className="justify-self-end flex flex-col justify-between items-end col-span-2">
				<div>
					<Price price={product.price * productInfo.quantity}/>
				</div>
				{
					product.quantity > 0
						?
						<div className="flex flex-row border-2 mt-3">
							<button className="w-10 h-10 grid place-items-center disabled:text-gray-300" disabled={productInfo.quantity - 1 < 1} onClick={()=>handleUpdateQuantity(-1)}>
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
							</button>
							<span className="w-10 h-10 grid place-items-center">{productInfo.quantity}</span>
							<button className="w-10 h-10 grid place-items-center disabled:text-gray-300" disabled={productInfo.quantity + 1 > product.quantity} onClick={()=>handleUpdateQuantity(1)}>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
							</button>
						</div>
						:
						<div className="underline text-blue-500 hover:cursor-pointer" onClick={() => dispatch(removeFromCart(productInfo))}>Remove from Cart</div>
				}
			</div>
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
		<div className="pt-36 min-h-screen container mx-auto 2xl:px-28">
			<h1 className="text-6xl font-bold mb-4">Shopping Cart</h1>
			<div className="gap-x-4 flex flex-col md:flex-row gap-y-4 container mx-auto">
				{/* CART */}
				<div className="bg-white md:flex-[9]">
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
				<div className="w-full md:flex-[5]">
					<div className="p-6 bg-black text-white">
						<h1 className="text-3xl font-bold">Your Cart</h1>
						<hr className="my-4"/>

						<p className="flex flex-row items-end justify-between mb-2">
							Subtotal: <Price price={(cart.reduce((a: number, p) => a + (p.product?.price || 0) * p.quantity, 0))}/>
						</p>

						<div className="text-black">
							<button className="my-1 p-2 rounded-sm w-full disabled:text-gray-500 bg-white font-normal" onClick={handleClearCart} disabled={cart.length <= 0}>
								Clear Cart
							</button>
							<Link href="/checkout">
							<button className="my-1 p-2 rounded-sm w-full disabled:text-gray-500 bg-white font-bold" disabled={cart.length <= 0}>
								Checkout
							</button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
		</>
	);
}

export default Cart;