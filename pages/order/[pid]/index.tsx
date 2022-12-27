import { doc, getDoc } from "firebase/firestore";
import db from "../../../util/firebase/firestore"
import { GetServerSideProps } from "next";
import { firestoreOrder, order } from "../../../types/order";
import Price from "../../../components/price";
import Link from "next/link";
import { getProductByID } from "../../../util/fillProduct";
import { useDispatch } from "react-redux";
import { clearCart } from "../../../util/redux/cart.slice";
import { useRouter } from "next/router";

const Order = ({ order, firstTime }: { order: order,firstTime: boolean }) => {
	order.date = new Date(order.date)

	const dispatch = useDispatch()
	const router = useRouter()
	if(firstTime){
		dispatch(clearCart())
		router.replace(router.asPath.split('?')[0], undefined, {shallow: true})
	}

	return (
		<div className="w-screen h-screen grid place-items-center bg-gray-200">
			<div className="bg-white p-4 border-2 rounded-lg">
				<h1 className="font-bold text-3xl">
					Order Complete
				</h1>
				
				<p>Order ID: <Link href="#" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">{order.orderID}</Link></p>
				<p>Order Timestamp: {order.date.toLocaleDateString()} at {order.date.toLocaleTimeString()}</p>
				{order.products.map(productInfo=>{
					const {product} = productInfo
					if(!product) return(<div></div>)
					return(
						<div key={productInfo.PID} className="flex flex-row items-center gap-x-2">
							<img src={product.productImageURL} className="h-10" alt="" />
							<p>{product.productName}</p>
							<p><Price price={product.price}/> x {productInfo.quantity}</p>
						</div>
					)
				})}
				<p className="text-xl">Total: <Price price={(order.orderPrice / 100)}/></p>
			</div>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const orderDoc = await getDoc(doc(db, "orders", ctx.query.pid as string))
	const firestoreOrder = orderDoc.data() as firestoreOrder
	const order = { ...firestoreOrder, orderID: orderDoc.id, date: firestoreOrder.dateTS.toDate() } as order
	
	order.products = await Promise.all(order.products.map(async productInfo=>{
		productInfo.product = await getProductByID(productInfo.PID)
		return productInfo
	}))

	return{
		props:{
			order: JSON.parse(JSON.stringify(order)),
			firstTime: ctx.query.first == "true",
		}
	}
}

export default Order