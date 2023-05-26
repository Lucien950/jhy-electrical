// types
import { PayPalError } from "types/paypal";
import { Address } from "@paypal/paypal-js"
// util
import { makePrice } from "util/priceUtil";
import { getOrder } from "util/paypal/server/getOrderFetch";
import { generateAccessToken } from "util/paypal/server/auth";
import { PAYPALDOMAIN } from "util/paypal/server/domain";
import { fillOrderProducts } from "util/orderUtil";

export const updateOrderAddress = async (token: string, newAddress: Address, fullName: string) => {
	const orders = await getOrder(token)
	const { products: emptyProducts } = orders
	const products = await fillOrderProducts(emptyProducts)
	const newPrice = await makePrice(products, newAddress)
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
						value: newPrice.shipping.toFixed(2)
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