import { OrderProductFilled } from "types/order"
import { calculateShipping, productPackageInfo } from "./shipping/calculateShipping"
import { PriceInterface } from "types/price"

export const TAX_RATE = 0.13

export const roundPriceUp = (n: number)=>{
	return Math.ceil(n*100)/100
}

/**
 * Given products and a optional location, calculates the price of the order
 * @param products Products in the order, MUST HAVE product field filled in
 * @param postal_code Postal Code of delievery
 * @returns Price of the order, subtotal, shipping, tax, total
 */
export const makePrice = async (products: OrderProductFilled[], postal_code?: string) => {
	if (!products.every(p => p.product)) throw "Some products have not been filled in"
	const subtotal = roundPriceUp(products.reduce((acc, p) => acc + p.quantity * p.product!.price, 0))

	const productPackage = products.map(p => {
		const { weight, length, height, width } = p.product!
		return { weight, length, height, width, id: p.PID } as productPackageInfo
	})
	const shippingInfo = postal_code ? await calculateShipping(productPackage, postal_code) : undefined
	const shipping = shippingInfo
		? roundPriceUp(products.reduce((acc, p) => acc + (p.quantity * (shippingInfo[p.PID] || 0)), 0))
		: undefined
	const tax = roundPriceUp((subtotal + (shipping || 0)) * TAX_RATE)
	const total = subtotal + (shipping || 0) + tax

	return { subtotal, shipping, tax, total } as PriceInterface
}