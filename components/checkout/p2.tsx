// ui
import { motion } from "framer-motion";
import { displayVariants } from "util/formVariants";
import { PaypalSVG } from "components/paypalSVG";
import { Oval } from "react-loader-spinner";
// types
import CustomerInterface from "types/customer";
import { OrderProduct } from "types/order";
import { PriceInterface } from "types/price";
// react
import { MouseEventHandler, useState } from "react";
import { useRouter } from "next/router"
// state
import { clearCart } from 'util/redux/cart.slice';
// firebase to write order
import { useDispatch } from "react-redux";
import { submitOrder } from "util/paypal/client/submitOrderClient";

type ReviewViewProps = {
	customerInformation: CustomerInterface,
	paymentInformation: PriceInterface,
	cart?: OrderProduct[],
	goToShipping: MouseEventHandler<HTMLButtonElement>,
	goToPayment: MouseEventHandler<HTMLButtonElement>,
	orderID: string
}

const ReviewView = ({ customerInformation, paymentInformation, cart, goToShipping, goToPayment, orderID }: ReviewViewProps) => {
	const router = useRouter()
	const dispatch = useDispatch()
	const [submitOrderLoading, setSubmitOrderLoading] = useState(false)
	
	const handleOrder: MouseEventHandler<HTMLButtonElement> = async () => {
		setSubmitOrderLoading(true)

		// for extra security
		if (Object.values(paymentInformation).some(p=>p == 0)){
			setSubmitOrderLoading(false)
			console.error("Payment Information is not Complete")
			return
		}
		if (!customerInformation.payment_source) {
			setSubmitOrderLoading(false)
			console.error("Payment Method Paypal does not have paypal information object")
			return
		}

		let firebaseOrderID;
		switch (customerInformation.paymentMethod){
			case "paypal":
				try{
					firebaseOrderID = (await submitOrder(orderID)).orderID
				}
				catch{
					setSubmitOrderLoading(false)
					return
				}
				break
			case "card":
				// TODO Process Card Hosted Fields
				console.log("process card")
				break
			default:
				console.log(customerInformation.paymentMethod, "is not a valid payment source")
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
					<p> {customerInformation.fullName}</p>
					{
						customerInformation.address &&
						<>
							<p> {customerInformation.address.address_line_1} </p>
							<p> {customerInformation.address.address_line_2} </p>
							<p> {customerInformation.address.admin_area_2}, {customerInformation.address.admin_area_1}, {customerInformation.address.postal_code} </p>
						</>
					}
				</div>
				<button className="underline" onClick={goToShipping}>Edit</button>
			</div>
			{/* payment method */}
			<div className="bg-gray-200 p-5 flex flex-row mb-2">
				<h1 className="flex-[2] text-base"> Payment Method </h1>
				<div className="flex-[5]">
					{
						customerInformation.paymentMethod == "paypal" &&
						<div>
							<PaypalSVG className="h-6" />
							<p className="text-sm">Email: {customerInformation.payment_source?.paypal?.email_address}</p>
						</div>
					}
					{
						customerInformation.paymentMethod == "card" &&
						<div>
							{/* TODO After getting cards sorted */}
							testing testing
						</div>
					}
				</div>
				<button className="underline" onClick={goToPayment}>Edit</button>
			</div>
			{/* items */}
			<div className="bg-gray-200 p-5 mb-2">
				<h1 className="mb-4 text-lg"> Items </h1>
				<div className="grid grid-cols-2">
					{cart
						? cart.map(p =>
							<div className="flex flex-row gap-x-2 items-center" key={p.PID}>
								<img src={p.product?.productImageURL} alt="Product Image" className="h-16" />
								<div className="flex-1 text-sm">
									<h1 className="font-bold text-base">{p.product?.productName}</h1>
									<p>${p.product?.price.toFixed(2)}</p>
									<p>{p.product?.description}</p>
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
				<button className="underline" onClick={goToPayment}>Back to Payment</button>
				<button className="bg-black p-4 px-24 text-white text-bold relative grid place-items-center" onClick={handleOrder}>
					<Oval height={20} width={20} strokeWidth={8} strokeWidthSecondary={8} color="#28a9fa" secondaryColor="#28a9fa" wrapperClass={`absolute translate-x-[-60px] transition-[opacity] opacity-0 ${submitOrderLoading && "!opacity-100"}`} />
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