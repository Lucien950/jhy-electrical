import { createOrderProps, createOrderRes } from "pages/api/paypal/createorder"
import { OrderProduct, validateOrderProductFilledList, validateOrderProductFilledListError } from "types/order"
import { apiResponse } from "util/paypal/server/api"
import { clientErrorFactory } from "util/paypal/client/clientErrorFactory"

const createOrderError = clientErrorFactory("Order Link Server Error: Check console for more information")
/**
 * Function against local paypal API endpoint
 * @param amount Amount of money to pay
 * @returns object of type createOrderAPIReturn
 */
export const createPayPalOrderLink = async (products: OrderProduct[], express = false) => {
	if (!validateOrderProductFilledList(products)) return createOrderError(validateOrderProductFilledListError(products))
	const response = await fetch(`/api/paypal/createorder`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			products: products.map(p => ({ ...p, product: undefined })), express } as createOrderProps)
	})


	const { res, err } = await response.json() as apiResponse<createOrderRes, any>
	console.log("ERROR", err)
	if(response.ok){
		if(!res) return createOrderError("This code should not be reachable, since response.ok is true")
		if (res.orderStatus == "COMPLETED") return createOrderError("REQUEST ID HAS BEEN USED")
		if (!res.redirect_link) return createOrderError("Redirect Link could not be found")
		return Object.assign(res, {redirect_link: res.redirect_link})
	}
	else return createOrderError(err)
}