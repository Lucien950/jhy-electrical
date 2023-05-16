import { createOrderAPIProps, createOrderAPIRes } from "pages/api/paypal/createorder"
import { OrderProduct } from "types/order"
import { apiResponse } from "util/api"

/**
 * Function against local paypal API endpoint
 * @param amount Amount of money to pay
 * @returns object of type createOrderAPIReturn
 */
export const createPayPalOrderLink = async (products: OrderProduct[], cancel_url: string, postal_code?: string) => {
	const response = await fetch(`/api/paypal/createorder`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ products: products.map(p => ({ ...p, product: undefined })), postal_code, cancel_url } as createOrderAPIProps)
	})

	const { res, err } = await response.json() as apiResponse<createOrderAPIRes, any>
	const { redirect_link, orderStatus } = res!
	if(response.ok && redirect_link){
		if (orderStatus == "COMPLETED") throw new Error("REQUEST ID HAS BEEN USED")
		if (!redirect_link) throw new Error("Redirect Link could not be found")
		return res!
	}
	else throw new Error(err)
}