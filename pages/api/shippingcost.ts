import type { NextApiRequest, NextApiResponse } from 'next'
import { apiRespond } from 'util/api'
import { calculateShipping, productPackageInfo } from 'util/shipping/calculateShipping'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const body = JSON.parse(req.body)
	const { destination, products }: { destination: string, products: productPackageInfo[]} = body
	const prices = calculateShipping(products, destination)
	apiRespond(res, "response", prices)
}