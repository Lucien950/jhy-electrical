// api
import { NextApiRequest, NextApiResponse } from "next";
import { apiRespond } from "util/api";
// types
import { updateOrderAddressProps, updateOrderAddressRes } from ".";
import { PayPalError, validateAddress } from "types/paypal";
import { Address } from "@paypal/paypal-js"
// util
import { makePrice } from "util/priceUtil";
import { getOrder } from "util/paypal/server/getOrderFetch";
import { getProductByID } from "util/productUtil";
import { generateAccessToken } from "util/paypal/server/auth";
import { PAYPALDOMAIN } from "util/domain";

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

	const response = await fetch(`${PAYPALDOMAIN}/v2/checkout/orders/${token}`, options)
	if (!response.ok) throw await response.json() as PayPalError

	return newPrice
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
	const { token, address: newAddress, fullName } = req.body as updateOrderAddressProps
	// validation
	if (!token || !newAddress || !fullName) return apiRespond(res, "error", "Did not send all required body props")
	if (typeof token != "string") return apiRespond(res, "error", "Token not well formed")
	if (!validateAddress(newAddress)) return apiRespond(res, "error", "Address not well formed")
	if (typeof fullName != "string") return apiRespond(res, "error", "Name not well formed")

	try {
		const newPrice = await updateOrderAddress(token, newAddress, fullName)
		return apiRespond<updateOrderAddressRes>(res, "response", { newPrice })
	}
	catch (e) {
		return apiRespond(res, "error", e)
	}
}