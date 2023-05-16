import { createOrderAPIProps, createOrderAPIReturn } from "pages/api/paypal/createorder"
import { OrderProduct } from "types/order"

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

	const responseData = await response.json() as createOrderAPIReturn
	const { redirect_link, orderStatus } = responseData
	if(response.ok && redirect_link){
		if (orderStatus == "COMPLETED") throw new Error("REQUEST ID HAS BEEN USED")
		if (!redirect_link) throw new Error("Redirect Link could not be found")
		return responseData
	}
	else {
		console.warn(responseData)
		throw new Error("Response Error: Check console for more details")
	}
}