import { Address } from "types/address"
import { apiResponse } from "server/api"
import { updateOrderAddressProps, updateOrderAddressRes } from "app/api/paypal/order/update/address"

/**
 * Interface to update order address (consequently shipping price)
 * @param orderID ID of order in question
 * @param products products to be delivered
 * @param address to this address
 * @returns 
 */
export const updateOrderAddress = async (orderID: string, address: Address, fullName: string)=>{
	const response = await fetch("/api/paypal/updateorder/address", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ token: orderID, address, fullName } as updateOrderAddressProps)
	})
	const {res, err} = await response.json() as apiResponse<updateOrderAddressRes, unknown>
	if (!response.ok) throw err
	return res!
}