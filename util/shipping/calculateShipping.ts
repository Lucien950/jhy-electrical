import CanadaPostClient from "canadapost-api"
import { OrderProduct } from "types/order";

const userID = process.env.NODE_ENV === "development" ? process.env.NEXT_PUBLIC_CANADAPOST_USERID_DEV : process.env.NEXT_PUBLIC_CANADAPOST_USERID
const password = process.env.NODE_ENV === "development" ? process.env.NEXT_PUBLIC_CANADAPOST_PASSWORD_DEV : process.env.NEXT_PUBLIC_CANADAPOST_PASSWORD
const cpc = new CanadaPostClient(userID, password, process.env.NEXT_PUBLIC_CANADAPOST_CUSTOMERID);
export interface productPackageInfo {
	width: number,
	height: number,
	length: number,
	weight: number,
	id: string,
}

export const calculateShipping = async (products: productPackageInfo[], destination: string) => {
	const prices = {} as { [key: string]: number }
	await Promise.all(products.map(async p => {
		const rates = await cpc.getRates({
			parcelCharacteristics: {
				weight: p.weight,
				dimensions: {
					length: p.length,
					width: p.width,
					height: p.height
				}
			},
			originPostalCode: "K4M1B4",
			destination: {
				domestic: {
					postalCode: destination.split(" ").join("").toUpperCase()
				}
			}
		})
		if (rates == undefined) return 0
		const minimumPrice = Math.min(...rates.map((r: any) => r.priceDetails.due))
		prices[p.id] = minimumPrice
	}))
	return prices
}