import CanadaPostClient from "canadapost-api"

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
	const prices = {} as { [PID: string]: number }
	await Promise.all(products.map(async p => {
		if (p.id === "VuvgEZpucwwjiGrHrKEt") return prices[p.id] = 0.01
		const [height, width, length] = [p.width, p.height, p.length].sort()
		const rates = await cpc.getRates({
			parcelCharacteristics: {
				weight: p.weight,
				dimensions: { length, width, height }
			},
			originPostalCode: process.env.NEXT_PUBLIC_ORIGIN_POSTAL_CODE,
			destination: {
				domestic: {
					postalCode: destination.replace(" ", "").toUpperCase()
				}
			}
		})
		if (rates == undefined) throw new Error("Canada Post API cannot find rates for this package")
		const minimumPrice = Math.min(...rates.map((r: any) => r.priceDetails.due))
		prices[p.id] = minimumPrice
	}))
	return prices
}