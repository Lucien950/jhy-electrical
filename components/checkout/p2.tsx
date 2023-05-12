// ui
import { motion } from "framer-motion";
import { displayVariants } from "util/formVariants";
import { PaypalSVG } from "components/paypalSVG";
import { Oval } from "react-loader-spinner";
// types
import CustomerInterface from "types/customer";
import { FirestoreOrderInterface, Price, productInfo } from "types/order";
// react
import { Dispatch, MouseEventHandler, SetStateAction } from "react";
import { useRouter } from "next/router"
// state
import { clearCart } from 'util/redux/cart.slice';
// firebase to write order
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from "util/firebase/firestore"
import { useDispatch } from "react-redux";

type ReviewViewProps = {
	customerInformation: CustomerInterface,
	paymentInformation: Price,
	submitOrderLoading: boolean,
	setSubmitOrderLoading: Dispatch<SetStateAction<boolean>>,
	cart: productInfo[],
	goToShipping: MouseEventHandler<HTMLButtonElement>,
	goToPayment: MouseEventHandler<HTMLButtonElement>
}

const ReviewView = ({ customerInformation, paymentInformation, submitOrderLoading, setSubmitOrderLoading, cart, goToShipping, goToPayment }: ReviewViewProps) => {
	const router = useRouter()
	const dispatch = useDispatch()
	
	const handleOrder: MouseEventHandler<HTMLButtonElement> = async () => {
		setSubmitOrderLoading(true)

		const newOrder = {
			products: cart,
			orderPrice: paymentInformation,
			dateTS: Timestamp.now(),
			completed: false,

			name: `${customerInformation.first_name} ${customerInformation.last_name}`,
			email: customerInformation.paypalInfo?.paypalEmail,
			address: customerInformation.address,
		} as FirestoreOrderInterface

		if (customerInformation.paymentMethod == "paypal") {
			if (!customerInformation.paypalInfo) {
				setSubmitOrderLoading(false)
				console.error("Payment Method Paypal does not have paypal information object")
				return
			}
			const updateResponse = await fetch("/api/paypal/updateorder", {
				method: "PATCH",
				body: JSON.stringify({ amount: paymentInformation.total, token: customerInformation.paypalInfo.token })
			}).catch(err => console.error(err))
			if (!updateResponse) return
			const response = await fetch("/api/paypal/submitorder", {
				method: "POST",
				body: JSON.stringify({ token: customerInformation.paypalInfo.token })
			})
				.catch(err => {
					console.error(err)
				})
			if (!response) {
				setSubmitOrderLoading(false)
				return
			}
			newOrder.paypalOrderID = customerInformation.paypalInfo.token
		}
		else if (customerInformation.paymentMethod == "card") {
			// TODO Process Card Hosted Fields
			console.log("process card")
		}
		else {
			console.log(customerInformation.paymentMethod, "is not a valid payment source")
			setSubmitOrderLoading(false)
			return
		}

		const doc = await addDoc(collection(db, "orders"), newOrder)
			.catch(err => {
				console.error(err)
			})

		if (!doc) {
			setSubmitOrderLoading(false)
			return
		}
		dispatch(clearCart())
		router.push(`/order/${doc.id}`)
	}
	
	return (
		<motion.div variants={displayVariants} transition={{ duration: 0.08 }} initial="hidden" animate="visible" exit="hidden" key="reviewView">
			{/* shipping address */}
			<div className="bg-gray-200 p-5 flex flex-row mb-2">
				<h1 className="flex-[2] text-base"> Shipping Address </h1>
				<div className="flex-[5]">
					<p> {customerInformation.first_name} {customerInformation.last_name}</p>
					<p> {customerInformation.address.address_line_1} </p>
					<p> {customerInformation.address.address_line_2} </p>
					<p> {customerInformation.address.admin_area_2}, {customerInformation.address.admin_area_1}, {customerInformation.address.postal_code} </p>
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
							<p className="text-sm">Email: {customerInformation.paypalInfo?.paypalEmail}</p>
						</div>
					}
					{
						customerInformation.paymentMethod == "card" &&
						<div>
							{/* TODO After getting cards sorted */}
						</div>
					}
				</div>
				<button className="underline" onClick={goToPayment}>Edit</button>
			</div>
			{/* items */}
			<div className="bg-gray-200 p-5 mb-2">
				<h1 className="mb-4 text-lg"> Items </h1>
				<div className="grid grid-cols-2">
					{cart.map(p =>
						<div className="flex flex-row gap-x-2 items-center" key={p.PID}>
							<img src={p.product?.productImageURL} alt="Product Image" className="h-16" />
							<div className="flex-1 text-sm">
								<h1 className="font-bold text-base">{p.product?.productName}</h1>
								<p>${p.product?.price.toFixed(2)}</p>
								<p>{p.product?.description}</p>
							</div>
						</div>
					)}
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