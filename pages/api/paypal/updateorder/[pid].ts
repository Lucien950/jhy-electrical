import { NextApiRequest, NextApiResponse } from "next";

import { getOrder } from "util/paypal/getOrder";
import { generateAccessToken } from "util/paypal/auth";
import { makePrice } from "util/priceUtil";
import { getProductByID } from "util/productUtil";

import { updateOrderProps, updateOrderReturn } from ".";
import { Address } from "@paypal/paypal-js"
import { FIRSTLASTDENOM } from "util/paypal/getOrder";

const updateOrderAddress = async (token: string, newAddress: Address, name: { firstName: string, lastName: string }) => {
	const { products: productIDS } = await getOrder(token)
	const products = await Promise.all(productIDS.map(async p=>({...p, product: await getProductByID(p.PID)})))
	const newPrice = await makePrice(products, newAddress.postal_code)
	const body = [
		{
			op: "add",
			path: `/purchase_units/@reference_id=='default'/shipping/address`,
			value: newAddress
		},
		{
			op: "add",
			path: "/purchase_units/@reference_id=='default'/shipping/name",
			value: {
				full_name: [name.firstName, name.lastName].join(FIRSTLASTDENOM)
			}
		},
		{
			op: "replace",
			path: `/purchase_units/@reference_id=='default'/amount`,
			value: {
				currency_code: "CAD",
				value: newPrice.total.toFixed(2),
				breakdown: {
					item_total: {
						currency_code: "CAD",
						value: newPrice.subtotal.toFixed(2)
					},
					shipping: {
						currency_code: "CAD",
						value: newPrice.shipping!.toFixed(2)
					},
					tax_total: {
						currency_code: "CAD",
						value: newPrice.tax.toFixed(2)
					},
				}
			}
		}
	]

	const options = {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await generateAccessToken()}`
		},
		body: JSON.stringify(body)
	};

	const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}`, options)
	if (!response.ok) throw new Error(JSON.stringify({ status: response.status, err: await response.json() }))
	return { newPrice }
}
export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { pid } = req.query

	switch (pid) {
		case "address":
			const { token, address, name } = req.body as updateOrderProps
			if (!token || typeof token != "string" || !address || !name || !(typeof name == "object")) {
				res.status(500).send({ error_message: "Did not send all required body props" })
				return
			}
			try {
				const { newPrice } = await updateOrderAddress(token, address, name)
				res.status(200).send({ newPrice } as updateOrderReturn)
			}
			catch (e: any) {
				res.status(500).send({ error_message: e.message})
			}
			break
		default:
			res.status(500).send({ error_message: "Invalid Order Update" })
			break
	}
}