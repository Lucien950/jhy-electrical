import { OrderProduct } from "types/order"
import { calculateShipping, productPackageInfo } from "./shipping/calculateShipping"

export const TAX_RATE = 0.13

export const roundPriceUp = (n: number)=>{
	return Math.ceil(n*100)/100
}

export interface PriceInterface {
	subtotal: number,
	shipping?: number,
	tax: number,
	total: number
}
export interface FinalPriceInterface{
	subtotal: number,
	shipping: number,
	tax: number,
	total: number
}

export const makePrice = async (products: OrderProduct[], postal_code?: string) => {
	if (!products.every(p => p.product)) throw "Some products have not been filled in"
	const subtotal = roundPriceUp(products.reduce((acc, p) => acc + p.quantity * p.product!.price, 0))

	const productPackage = products.map(p => {
		const { weight, length, height, width } = p.product!
		return { weight, length, height, width, id: p.PID } as productPackageInfo
	})
	const shippingInfo = postal_code ? await calculateShipping(productPackage, postal_code) : undefined
	const shipping = shippingInfo ? roundPriceUp(products.reduce((acc, p) => acc + (p.quantity * (shippingInfo[p.PID] || 0)), 0)) : 0
	const tax = roundPriceUp((subtotal + shipping) * TAX_RATE)
	const total = subtotal + shipping + tax

	return { subtotal, shipping, tax, total } as PriceInterface
}