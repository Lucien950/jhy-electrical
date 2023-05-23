// ui
import { motion } from "framer-motion";
import { displayVariants } from "util/formVariants";
import { PaypalSVG } from "components/paypalSVG";
import { Oval } from "react-loader-spinner";
// types
import { CustomerInterface } from "types/customer";
import { OrderProductFilled } from "types/order";
import { PriceInterface } from "types/price";
// react
import { Dispatch, MouseEventHandler, SetStateAction, useState } from "react";
import { useRouter } from "next/router"
// state
import { clearCart } from 'util/redux/cart.slice';
// firebase to write order
import { useDispatch } from "react-redux";
import { submitOrder } from "util/paypal/client/submitOrder_client";
import { CardElement } from "components/cardElement";
import { toast } from "react-toastify";

type ReviewViewProps = {
	customerInfo: CustomerInterface,
	priceInfo: PriceInterface,
	orderCart: OrderProductFilled[] | null,
	setStage: Dispatch<SetStateAction<number>>,
	orderID: string
}

const ReviewView = ({ customerInfo, priceInfo, orderCart, orderID, setStage }: ReviewViewProps) => {
	const router = useRouter()
	const dispatch = useDispatch()
	const [submitOrderLoading, setSubmitOrderLoading] = useState(false)
	
	const handleOrder: MouseEventHandler<HTMLButtonElement> = async () => {

		// for extra security
		if (Object.values(priceInfo).some(p=>p == 0)){
			console.error("Payment Information is not Complete")
			return
		}
		if (!customerInfo.payment_source) {
			console.error("Payment Method Paypal does not have paypal information object")
			return
		}

		setSubmitOrderLoading(true)
		let firebaseOrderID;
		try {
			firebaseOrderID = (await submitOrder(orderID)).firebaseOrderID
		}
		catch(e) {
			toast.error((e as Error).message, {theme: "colored"})
			setSubmitOrderLoading(false)
			return
		}
		
		dispatch(clearCart())
		router.push(`/order/${firebaseOrderID}`)
	}
	
	return (
		<motion.div variants={displayVariants} transition={{ duration: 0.08 }} initial="hidden" animate="visible" exit="hidden" key="reviewView">
			{/* shipping address */}
			<div className="bg-gray-200 p-5 flex flex-row mb-2">
				<h1 className="flex-[2] text-base"> Shipping Address </h1>
				<div className="flex-[5]">
					<p> {customerInfo.fullName}</p>
					{
						customerInfo.address &&
						<>
							<p> {customerInfo.address.address_line_1} </p>
							<p> {customerInfo.address.address_line_2} </p>
							<p> {customerInfo.address.admin_area_2}, {customerInfo.address.admin_area_1}, {customerInfo.address.postal_code} </p>
						</>
					}
				</div>
				<button className="underline" onClick={()=>setStage(0)}>Edit</button>
			</div>
			{/* payment method */}
			<div className="bg-gray-200 p-5 flex flex-row mb-2 items-start">
				<h1 className="flex-[2] text-base"> Payment Method </h1>
				<div className="flex-[5]">
					{
						customerInfo.paymentMethod == "paypal" &&
						<div>
							<PaypalSVG className="h-6" />
							<p className="text-sm">Email: {customerInfo.payment_source?.paypal?.email_address}</p>
						</div>
					}
					{
						(customerInfo.paymentMethod == "card" && customerInfo.payment_source?.card) &&
						<div>
							<CardElement cardInformation={customerInfo.payment_source.card} />
						</div>
					}
				</div>
				<button className="underline" onClick={()=>setStage(1)}>Edit</button>
			</div>
			{/* items */}
			<div className="bg-gray-200 p-5 mb-2">
				<h1 className="mb-4 text-lg"> Items </h1>
				<div className="grid grid-cols-2">
					{orderCart
						? orderCart.map(p =>
							<div className="flex flex-row gap-x-2 items-center" key={p.PID}>
								<img src={p.product.productImageURL} alt="Product Image" className="h-16" />
								<div className="flex-1 text-sm">
									<h1 className="font-bold text-base">{p.product.productName}</h1>
									<p>${p.product.price.toFixed(2)}</p>
									<p>{p.product.description}</p>
								</div>
							</div>
						)
						: <div>
								<Oval height={30} strokeWidth={10} strokeWidthSecondary={10} color="black" secondaryColor="black" />
							</div>
					}
				</div>
			</div>
			{/* submit buttons */}
			<div className="flex flex-row items-center justify-end gap-x-6">
				<button className="underline" onClick={()=>setStage(1)}>Back to Payment</button>
				<button className="bg-black p-4 px-24 text-white text-bold relative grid place-items-center" onClick={handleOrder}>
					<Oval height={20} width={20} strokeWidth={8} strokeWidthSecondary={8} color="white" secondaryColor="white" wrapperClass={`absolute translate-x-[-60px] transition-[opacity] opacity-0 ${submitOrderLoading && "!opacity-100"}`} />
					<span className={`absolute transition-transform ${submitOrderLoading && "translate-x-[10px]"}`}>
						Submit Order
					</span>
					<span className="invisible">Submit Order</span>
				</button>
			</div>

			{/* line and disclaimer */}
			<hr className='my-4' />
			<div>
				<p className="font-bold">PLACEHOLDER TEXT, IS NOT REFLECTIVE OF COMPANY POLICY</p>
				<p>By clicking on the &quot;SUBMIT ORDER&quot; button, I agree that I have read and accept these Terms of Use.</p>
				<p> View Privacy Policy. </p>
				<p> Sale and discounted items can only be exchanged or returned for merchandise credit. </p>
				<p> Gift cards may not be redeemed for cash or refunded unless required by law. </p>
			</div>
		</motion.div>
	)
}

export default ReviewView;