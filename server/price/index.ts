// util
import { Decimal } from 'decimal.js';
import { calculateShippingProducts } from "./calculateShipping"
import { productPackageInfo } from "./canadapost";
// types
import { OrderProduct } from "types/order"
import { Price, FormPrice } from "types/price"
import { Address, PROVINCE_NAME_TO_CODE, subAddr } from "types/address";
import { ProductWithVariant } from "types/product";

const TAX_RATE_BY_PROVINCE = new Map(Object.entries({
	"AB": 0.05,
	"BC": 0.12,
	"MB": 0.12,
	"NB": 0.15,
	"NL": 0.15,
	"NT": 0.05,
	"NS": 0.15,
	"NU": 0.05,
	"ON": 0.13,
	"PE": 0.15,
	"QC": 0.14975,
	"SK": 0.11,
	"YT": 0.05
}))

const getTaxRate = (province: string) => {
	const provinceCode = PROVINCE_NAME_TO_CODE.get(province.toLowerCase())
	if(!provinceCode) {
		throw new Error("Province not found")
	}
	return TAX_RATE_BY_PROVINCE.get(provinceCode)!
}

/**
 * @param products Products in the order, MUST HAVE product field filled in
 * @param address Price of the order, subtotal, total (no shipping, no tax)
 */
export async function calculatePrice(products: (OrderProduct & {product: ProductWithVariant})[]): Promise<FormPrice>;
/**
 * @param products Products in the order, MUST HAVE product field filled in
 * @returns Price of the order, subtotal, shipping, tax, total
 */
export async function calculatePrice(products: (OrderProduct & {product: ProductWithVariant})[], address: subAddr): Promise<Price>;
/**
 * @param products Products in the order, MUST HAVE product field filled in
 * @returns Price of the order, subtotal, shipping, tax, total
 */
export async function calculatePrice(products: (OrderProduct & {product: ProductWithVariant})[], address: Address): Promise<Price>;
/**
 * Given products and a optional location, calculates the price of the order
 * @param products Products in the order, MUST HAVE product field filled in
 * @param address 
 * @returns Price of the order, subtotal, shipping, tax, total
 * @throws If the province is not valid
 */
export async function calculatePrice(products: (OrderProduct & {product: ProductWithVariant})[], address?: subAddr | Address) {
	const subtotal = products.reduce((acc, p) => {
		const pQuant = new Decimal(p.quantity)
		const pPrice = new Decimal(p.product!.price)
		return acc.add(pQuant.times(pPrice))
	}, new Decimal(0))

	let shipping: Decimal | undefined = undefined;
	let tax: Decimal | undefined = undefined;
	if(address) {
		if(address.postal_code) {
			shipping = await calculateShippingProducts(products.map((p): productPackageInfo => {
						const { weight, length, height, width } = p.product!
						return { weight, length, height, width, quantity: p.quantity, id: p.PID }
					}), address.postal_code)
		}
		const province = address.admin_area_1
		if(province) {
			tax = new Decimal(getTaxRate(province)).times(subtotal.add(shipping || 0)).toDecimalPlaces(2)
		}
	}
	
	const total = subtotal.add(shipping || 0).add((tax || 0))
	return {
		subtotal: subtotal.toNumber(),
		shipping: shipping && shipping.toNumber(),
		tax: tax && tax.toNumber(),
		total: total.toNumber()
	}
}