"use client"
//react
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// types
import { Product, ProductVariantListing } from 'types/product'
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
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from 'util/firebase/storage';
import { Oval } from 'react-loader-spinner';

const useProductQuantity = (product: Product, selectedProductVariant: ProductVariantListing) => {
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

export default function ProductListing({ product }: { product: Product }) {
	const router = useRouter()
	const dispatch = useAppDispatch()

	// Quantity Adjuster
	const [selectedVariantSKU, setSelectedVariantSKU] = useState(product.variants[0].sku)
	const selectedProductVariant: ProductVariantListing = findProductVariant(product, selectedVariantSKU)!
	const { availableToAdd, selectedQuantity, setSelectedQuantity } = useProductQuantity(product, selectedProductVariant)

	// Add to cart handling
	const newOrderProduct = {
		PID: product.firestoreID,
		variantSKU: selectedVariantSKU,
		quantity: selectedQuantity
	}
	const [paypalProcessing, setPayPalProcessing] = useState(false)

	// image selection
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)
	const [currentVariantAllImageURLs, setCurrentVariantAllImageURLs] = useState<string[] | null>(null)
	useEffect(() => {
		setSelectedImageIndex(0)
		setCurrentVariantAllImageURLs(null)
		Promise.all(selectedProductVariant.images.map(url => getDownloadURL(ref(storage, `products/${url}`))))
			.then(v => {
				setCurrentVariantAllImageURLs(v)
			})
	}, [selectedVariantSKU]) // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="grid grid-cols-1 gap-y-4 lg:grid-cols-2 gap-x-24 mt-36 px-8 container mx-auto">
			<div>
				<div className="h-[calc(100vh-23rem)] w-full">
					{
						currentVariantAllImageURLs &&
						<img src={currentVariantAllImageURLs[selectedImageIndex]} alt={`Product Image for ${product.productName}`} className="w-full h-full object-contain" />
					}
					{
						!currentVariantAllImageURLs &&
						<div className="w-full h-full grid place-items-center">
							<Oval height={100} width={100} strokeWidth={8} color="#28a9fa" secondaryColor="#28a9fa" />
						</div>
					}
				</div>
				<div className="flex flex-row gap-x-2">
					{
						currentVariantAllImageURLs &&
						currentVariantAllImageURLs.map((url, i) => (
							<img key={`variant-images-${selectedVariantSKU}-${i}`} src={url} alt={`Product Image for ${product.productName}`}
								className="w-20 h-20 object-contain border-2 rounded-md hover:cursor-pointer hover:scale-105 transition-[transform,box-shadow] border-slate-200 shadow-sm hover:shadow-lg"
								onClick={() => setSelectedImageIndex(i)}
							/>
						))
					}
				</div>
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
							<button key={v.sku} onClick={() => setSelectedVariantSKU(v.sku)}
								className="p-2 border-2 hover:bg-neutral-200 data-[selected='true']:font-bold data-[selected='true']:border-blue-500" data-selected={v.sku === selectedVariantSKU}
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
						handleAddToCart={() => {
							if (availableToAdd <= 0) return toast.error("No more stock") // should be unreachable code, if button is acting right.
							dispatch(addToCart(newOrderProduct))
							logEvent(analytics(), "add_to_cart", { PID: product.firestoreID })
						}}
					/>
					<PayPalCartButton
						has_stock={availableToAdd > 0}
						handlePayPalExpressCheckout={async () => {
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
						}}
						selectedQuantity={selectedQuantity}
						paypalProcessing={paypalProcessing}
					/>
				</div>
			</div>
		</div>
	)
}