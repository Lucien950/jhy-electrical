"use client"
//react
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// types
import { ProductInterface, ProductVariantListing } from 'types/product'
import { OrderProduct } from 'types/order';
// util
import { findProductVariant } from 'util/product'
import { clamp } from 'lodash';
import { createPayPalOrder } from 'app/checkout/paypalClient';
// ui
import Price from 'components/price'
import { ResidentialIcon, CommercialIcon, IndustrialIcon } from 'components/categoryIcons'
import { QuantitySelector } from 'components/quantitySelector';
import { toast } from 'react-toastify';
import { AddCartButton } from './addcartbutton';
import { PayPalCartButton } from './paypalbutton';
// analytics
import { logEvent } from "firebase/analytics";
import { analytics } from "util/firebase/analytics";
// redux
import { addToCart } from 'util/redux/cart.slice';
import { useAppDispatch, useAppSelector } from 'util/redux/hooks';

const useProductQuantity = (product: ProductInterface, selectedProductVariant: ProductVariantListing) => {
	const cart = useAppSelector((state: { cart: OrderProduct[] }) => state.cart) as OrderProduct[]
	const [quantityInCart, setCartQuantity] = useState(0)
	const [availableToAdd, setAvailableToAdd] = useState(0)
	const [selectedQuantity, setSelectedQuantity] = useState(0)
	//eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => setCartQuantity(cart.find(p => (p.PID == product.firestoreID) && (p.variantSKU === selectedProductVariant.sku))?.quantity || 0), [selectedProductVariant, cart])
	//eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => setAvailableToAdd(Math.max(0, selectedProductVariant.quantity - quantityInCart)), [selectedProductVariant, quantityInCart])
	useEffect(() => setSelectedQuantity(s => {
		if (availableToAdd <= 0) return 0
		return clamp(s, 1, availableToAdd)
	}), [availableToAdd])//clamp to below availableToAdd
	return { availableToAdd, selectedQuantity, setSelectedQuantity }
}

export default function ProductListing({ product }: { product: ProductInterface }) {
	const router = useRouter()
	const dispatch = useAppDispatch()

	// Quantity Adjuster
	const [selectedVariant, setSelectedVariant] = useState(product.variants[0].sku)
	const selectedProductVariant: ProductVariantListing = findProductVariant(product, selectedVariant)!
	const { availableToAdd, selectedQuantity, setSelectedQuantity } = useProductQuantity(product, selectedProductVariant)


	// BUTTON HANDLERS
	const newOrderProduct = {
		PID: product.firestoreID,
		variantSKU: selectedVariant,
		quantity: selectedQuantity
	}
	const handleAddToCart = () => {
		if (availableToAdd <= 0) return toast.error("No more stock") // should be unreachable code, if button is acting right.
		dispatch(addToCart(newOrderProduct))
		logEvent(analytics(), "add_to_cart", { PID: product.firestoreID })
	}
	const [paypalProcessing, setPayPalProcessing] = useState(false)
	const handlePayPalExpressCheckout = async () => {
		setPayPalProcessing(true)
		try {
			const { redirect_link } = await createPayPalOrder([newOrderProduct], true)
			router.push(redirect_link)
		}
		catch (e) {
			toast.error((e as Error).message, { theme: "colored" })
		} finally {
			setPayPalProcessing(false)
		}
	}

	return (
		<div className="grid grid-cols-1 gap-y-4 lg:grid-cols-2 gap-x-24 mt-36 px-8 container mx-auto">
			<div>
				<img src={product.productImageURL} alt={`Product Image for ${product.productName}`} className="w-full" />
			</div>
			<div>
				<div className="p-4">
					{/* Basic Information */}
					<h1 className="font-bold text-4xl mb-1">{product.productName}</h1>
					<p className="mb-1 text-lg">{product.description}</p>
					<p className="mb-4 text-lg">{selectedProductVariant.color}</p>
					<p className="mb-1 text-lg">{selectedProductVariant.quantity} in stock, {availableToAdd > 0 ? availableToAdd : "No"} more to add</p>
					<div className="mb-3">
						<Price price={selectedProductVariant.price} large />
					</div>

					{/* variant selector */}
					<div className="flex flex-row gap-x-2">
						{product.variants.map(v =>
							<button key={v.sku} onClick={() => setSelectedVariant(v.sku)}
								className="p-2 border-2 hover:bg-neutral-200 data-[selected='true']:font-bold data-[selected='true']:border-blue-500" data-selected={v.sku === selectedVariant}
							>
								{v.label || "Default"}
							</button>
						)}
					</div>

					{/* Categories */}
					<div className="flex flex-row gap-x-4 mb-3 flex-wrap">
						{product.residential && <div className="flex flex-row items-center gap-x-2">{<ResidentialIcon className="w-10 h-10" />} Residential</div>}
						{product.commercial && <div className="flex flex-row items-center gap-x-2">{<CommercialIcon className="w-10 h-10" />} Commercial</div>}
						{product.industrial && <div className="flex flex-row items-center gap-x-2">{<IndustrialIcon className="w-10 h-10" />} Industrial</div>}
					</div>

					{/* Quantity Adjuster */}
					<div className="flex flex-row items-center gap-x-4 my-4">
						Qty
						<QuantitySelector quantity={selectedQuantity} setQuantity={setSelectedQuantity} maxValue={availableToAdd} />
					</div>

					{/* Add Cart */}
					<AddCartButton
						has_stock={availableToAdd > 0}
						soldOut={selectedQuantity === 0}
						handleAddToCart={handleAddToCart}
					/>
					<PayPalCartButton
						has_stock={availableToAdd > 0}
						handlePayPalExpressCheckout={handlePayPalExpressCheckout}
						selectedQuantity={selectedQuantity}
						paypalProcessing={paypalProcessing}
					/>
				</div>
			</div>
		</div>
	)
}