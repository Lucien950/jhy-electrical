import CanadaPostClient from "canadapost-api"
import { Decimal } from "decimal.js";
import { DEVENV } from "types/env";

const userID = DEVENV ? process.env.CANADAPOST_USERID_DEV : process.env.CANADAPOST_USERID
const password = DEVENV ? process.env.CANADAPOST_PASSWORD_DEV : process.env.CANADAPOST_PASSWORD
const cpc = new CanadaPostClient(userID, password, process.env.CANADAPOST_CUSTOMERID);
export interface productPackageInfo {
	width: number,
	height: number,
	length: number,
	weight: number,
	id: string,
	quantity: number,
}

export const calculateShippingProduct = async (product: productPackageInfo, destination: string) => {
	// TODO remove for $0 product
	if (product.id === "VuvgEZpucwwjiGrHrKEt") return new Decimal(0.01)
	
	const [height, width, length] = [product.width, product.height, product.length].sort()
	const rates: {priceDetails: {due: number}}[] = await cpc.getRates({
		parcelCharacteristics: {
			weight: product.weight,
			dimensions: { length, width, height }
		},
		originPostalCode: process.env.ORIGIN_POSTAL_CODE,
		destination: {
			domestic: {
				postalCode: destination.replace(" ", "").toUpperCase()
			}
		}
	})
	if (rates == undefined) throw new Error("Canada Post API cannot find rates for this package")
	const minimumPrice = new Decimal(Math.min(...rates.map(r => r.priceDetails.due)))
	return minimumPrice.times(new Decimal(product.quantity))
}

export const calculateShippingProducts = async (products: productPackageInfo[], destination: string) => {
	const prices = await Promise.all(products.map(async p => await calculateShippingProduct(p, destination)))
	return prices.reduce((acc, p) => acc.add(p), new Decimal(0)).toDecimalPlaces(2)
}