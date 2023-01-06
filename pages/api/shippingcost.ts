import CanadaPostClient from "canadapost-api"
import type { NextApiRequest, NextApiResponse } from 'next'

const userID = process.env.NEXT_PUBLIC_CANADAPOST_USERID
const password = process.env.NEXT_PUBLIC_CANADAPOST_PASSWORD
const cpc = new CanadaPostClient(userID, password, process.env.NEXT_PUBLIC_CANADAPOST_CUSTOMERID);


export default async (req: NextApiRequest, res: NextApiResponse) => {
	let error = false

	interface productPackageInfo{
		width: number,
		height: number,
		length: number,
		weight: number,
		quantity: number,
	}

	const body = JSON.parse(req.body)
	const products = body.products as productPackageInfo[]
	const { origin, destination } = body
	console.log(body)

	const prices = await Promise.all(products.map(async p=>{
		const rates = await cpc.getRates({
			parcelCharacteristics: {
				weight: p.weight,
				dimensions: {
					length: p.length,
					width: p.width,
					height: p.height
				}
			},
			originPostalCode: origin,
			destination: {
				domestic: {
					postalCode: destination
				}
			}
		}).catch((e:any)=>{
			res.status(500).send(e)
			error = true
		})
		if(rates == undefined) return 0
		const minimumPrice = Math.min(...rates.map((r: any)=>r.priceDetails.due))
		return minimumPrice * p.quantity
	}))
	if(error) return
	res.status(200).json(prices.reduce((a, p) => a + p, 0))
}