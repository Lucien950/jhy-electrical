// api

import { apiHandler } from "server/api";
import { updatePayPalOrderAddress } from "server/paypal";
import { attemptUpdateOrderAddressProps, updateOrderAddressRes } from ".";

async function updateOrderAddressHandler(req: Request) {
	const { token, address: newAddress, fullName } = attemptUpdateOrderAddressProps(await req.json())

	const newPrice = await updatePayPalOrderAddress(token, newAddress, fullName)
	return { newPrice } as updateOrderAddressRes
}

export const dynamic = 'force-dynamic'
export const PATCH = (req: Request) => apiHandler(req, updateOrderAddressHandler)