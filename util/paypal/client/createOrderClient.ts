import { createOrderAPIProps, createOrderAPIRes } from "pages/api/paypal/createorder"
import { OrderProduct } from "types/order"
import { apiResponse } from "util/api"
import { clientErrorFactory } from "util/clientErrorFactory"

const throwCreateOrderError = clientErrorFactory("Order Link Server Error: Check console for more information")
/**
 * Function against local paypal API endpoint
 * @param amount Amount of money to pay
 * @returns object of type createOrderAPIReturn
 */
export const createPayPalOrderLink = async (products: OrderProduct[], cancel_url: string, postal_code?: string) => {
	const response = await fetch(`/api/paypal/createorder`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ products: products.map(p => ({ ...p, product: undefined })), postal_code, cancelPath: cancel_url } as createOrderAPIProps)
	})

	const { res, err } = await response.json() as apiResponse<createOrderAPIRes, any>
	if(response.ok){
		if(!res) return throwCreateOrderError("This code should not be reachable, since response.ok is true")
		if (res.orderStatus == "COMPLETED") return throwCreateOrderError("REQUEST ID HAS BEEN USED")
		if (!res.redirect_link) return throwCreateOrderError("Redirect Link could not be found")
		return Object.assign(res, {redirect_link: res.redirect_link})
	}
	else return throwCreateOrderError(err)
}