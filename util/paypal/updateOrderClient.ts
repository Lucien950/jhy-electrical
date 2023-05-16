import { Address } from "@paypal/paypal-js"
import { updateOrderProps, updateOrderRes } from "pages/api/paypal/updateorder"
import { apiResponse } from "util/api"

// TODO maybe also customer information (name)
/**
 * Interface to update order address (consequently shipping price)
 * @param orderID ID of order in question
 * @param products products to be delivered
 * @param address to this address
 * @returns 
 */
export const updateOrderAddress = async (orderID: string, address: Address, name: { firstName: string, lastName: string })=>{
	const response = await fetch(`/api/paypal/updateorder/address`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token: orderID, address, name } as updateOrderProps)
	})
	const {res, err} = await response.json() as apiResponse<updateOrderRes, any>
	if (!response.ok) throw new Error(err)
	return res!
}