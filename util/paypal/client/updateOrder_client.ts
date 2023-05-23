import { Address } from "@paypal/paypal-js"
import { updateOrderAddressProps, updateOrderAddressRes } from "pages/api/paypal/updateorder"
import { apiResponse } from "util/paypal/server/api"
import { clientErrorFactory } from "util/paypal/client/clientErrorFactory"


const updateOrderAddressError = clientErrorFactory("Update Product Server Side Error: check console for more details")
/**
 * Interface to update order address (consequently shipping price)
 * @param orderID ID of order in question
 * @param products products to be delivered
 * @param address to this address
 * @returns 
 */
export const updateOrderAddress = async (orderID: string, address: Address, fullName: string)=>{
	const response = await fetch(`/api/paypal/updateorder/address`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token: orderID, address, fullName } as updateOrderAddressProps)
	})
	const {res, err} = await response.json() as apiResponse<updateOrderAddressRes, any>
	if (!response.ok) return updateOrderAddressError(err)
	return res!
}