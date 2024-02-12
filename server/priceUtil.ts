import { OrderProductFilled } from "types/order"
import { calculateShippingProducts, productPackageInfo } from "./shipping/calculateShipping"
import { FinalPriceInterface, PriceInterface } from "types/price"
import { Address } from "types/address";
import { Decimal } from 'decimal.js';
import { PROVINCE_NAME_TO_CODE } from "types/address";

const TAX_RATE_BY_PROVINCE: {[key: string]: number} = {
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
}

export type subAddr = Pick<Required<Address>, "postal_code" | "admin_area_1">
const DECIMAL_ZERO = new Decimal(0)

/**
 * @param products Products in the order, MUST HAVE product field filled in
 * @param address Price of the order, subtotal, total (no shipping, no tax)
 */
async function makePrice(products: OrderProductFilled[]): Promise<PriceInterface>;
/**
 * @param products Products in the order, MUST HAVE product field filled in
 * @returns Price of the order, subtotal, shipping, tax, total
 */
async function makePrice(products: OrderProductFilled[], address: subAddr): Promise<FinalPriceInterface>;
/**
 * @param products Products in the order, MUST HAVE product field filled in
 * @returns Price of the order, subtotal, shipping, tax, total
 */
async function makePrice(products: OrderProductFilled[], address: Address): Promise<FinalPriceInterface>;
/**
 * Given products and a optional location, calculates the price of the order
 * @param products Products in the order, MUST HAVE product field filled in
 * @param postal_code Postal Code of delievery
 * @returns Price of the order, subtotal, shipping, tax, total
 */
async function makePrice(products: OrderProductFilled[], address?: subAddr | Address) {
	if (!products.every(p => p.product)) throw "Some products have not been filled in"
	const subtotal = products.reduce((acc, p) => {
		const pQuant = new Decimal(p.quantity)
		const pPrice = new Decimal(p.product!.price)
		return acc.add(pQuant.times(pPrice))
	}, DECIMAL_ZERO)

	const shipping = address?.postal_code
		? await calculateShippingProducts(products.map(p => {
				const { weight, length, height, width } = p.product!
				return { weight, length, height, width, quantity: p.quantity, id: p.PID } as productPackageInfo
			}), address.postal_code)
		: undefined
	const TAX_RATE = address?.admin_area_1
		? new Decimal(TAX_RATE_BY_PROVINCE[PROVINCE_NAME_TO_CODE[address.admin_area_1.toLowerCase()]])
		: undefined
	const tax = TAX_RATE ? TAX_RATE.times(subtotal.add(shipping || 0)).toDecimalPlaces(2) : undefined
	const total = subtotal.add(shipping || 0).add((tax || 0))

	return {
		subtotal: subtotal.toNumber(),
		shipping: shipping && shipping.toNumber(),
		tax: tax && tax.toNumber(),
		total: total.toNumber()
	}
}

export {makePrice}