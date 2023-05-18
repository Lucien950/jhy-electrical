// api
import { NextApiRequest, NextApiResponse } from "next";
import { apiRespond } from "util/api";
// types
import { updateOrderAddressProps, updateOrderAddressRes } from ".";
import { validateAddress } from "types/paypal";
import { Address } from "@paypal/paypal-js"
// util
import { makePrice } from "util/priceUtil";
import { getOrder } from "util/paypal/server/getOrder";
import { getProductByID } from "util/productUtil";
import { generateAccessToken } from "util/paypal/server/auth";


export const updateOrderAddress = async (token: string, newAddress: Address, fullName: string) => {
	const orders = await getOrder(token)
	const { products: productIDS } = orders
	const products = await Promise.all(productIDS.map(async p => ({ ...p, product: await getProductByID(p.PID) })))
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
				full_name: fullName
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
						value: newPrice.shipping!.toFixed(2) // eslint-disable-line @typescript-eslint/no-non-null-assertion
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
	}

	const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}`, options)
	if (!response.ok) throw await response.json()

	return newPrice
}

export const updateOrderAddressAPI = async (req: NextApiRequest, res: NextApiResponse) => {
	const { token, address: newAddress, fullName } = req.body as updateOrderAddressProps
	// validation
	if (!token || !newAddress || !fullName) throw "Did not send all required body props"
	if (typeof token != "string") throw "Token not well formed"
	if (!validateAddress(newAddress)) throw "Address not well formed"
	if (typeof fullName != "string") throw "Name not well formed"

	try {
		const newPrice = await updateOrderAddress(token, newAddress, fullName)
		apiRespond<updateOrderAddressRes>(res, "response", { newPrice })
	}
	catch (e) {
		apiRespond(res, "error", e)
	}
}

/**
 * Update Order API Endpoint
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { pid } = req.query
	if (!pid) return apiRespond(res, "error", "PID is required")
	if (typeof pid != "string") return apiRespond(res, "error", "PID must be a string")
	// launchpad
	if (pid == "address") await updateOrderAddressAPI(req, res)
	else return apiRespond(res, "error", "Invalid Order Update Property")
}