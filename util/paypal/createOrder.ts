import { createOrderAPIReturn } from "pages/api/paypal/createorder"
import { OrderProduct } from "types/order"

/**
 * Function against local paypal API endpoint
 * @param amount Amount of money to pay
 * @returns 
 */
export const createPayPalOrderLink = async (products: OrderProduct[], postal_code?: string) => {
	const response = await fetch(`/api/paypal/createorder`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ products: products.map(p => ({ ...p, product: undefined })), postal_code })
	})

	const responseData = await response.json() as createOrderAPIReturn
	const { redirect_link, orderStatus } = responseData
	if(response.ok && redirect_link){
		if (orderStatus == "COMPLETED") throw new Error("REQUEST ID HAS BEEN USED")
		if (!redirect_link) throw new Error("Redirect Link could not be found")
		return responseData
	}
	else {
		console.error(responseData)
		throw new Error("Response Error: Check console for more details")
	}
}