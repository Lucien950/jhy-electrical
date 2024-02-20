import { Decimal } from "decimal.js";
import { canadaPost_getRates, productPackageInfo } from "./canadapost";

async function calculateShippingProduct(product: productPackageInfo, destinationPostalCode: string) {
	// TODO remove for $0 product
	if (product.id === "VuvgEZpucwwjiGrHrKEt") return new Decimal(0.01)
	const [height, width, length] = [product.width, product.height, product.length].sort()
	const cleanedDestinationPostalCode = destinationPostalCode.replace(" ", "").toUpperCase()
	const quotes = await canadaPost_getRates(cleanedDestinationPostalCode, { ...product, height, width, length })
	const minimumPrice = new Decimal(Math.min(...quotes.map(q=>q["price-details"].due)))
	return minimumPrice.times(new Decimal(product.quantity))
}


/**
 * Calculates the minimum shipping cost to a domestic destination, given it's postal code for a given product
 * @param products Product to calculate shipping for
 * @param destinationPostalCode Destination postal code
 * @returns Price of shipping all the products
 */
export async function calculateShippingProducts(products: productPackageInfo[], destinationPostalCode: string) {
	const prices = await Promise.all(products.map(p => calculateShippingProduct(p, destinationPostalCode)))
	return prices.reduce((acc, p) => acc.add(p), new Decimal(0)).toDecimalPlaces(2)
}