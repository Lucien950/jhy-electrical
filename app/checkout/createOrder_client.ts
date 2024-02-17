import { OrderProduct, OrderProductFilled, validateOrderProductFilledList } from "types/order"
import { apiResponse } from "server/api"
import { createOrderProps, createOrderRes } from "app/api/paypal/order/create/route"

/**
 * Function against local paypal API endpoint
 * @param amount Amount of money to pay
 * @returns object of type createOrderAPIReturn
 */
export const createPayPalOrder = async (products: OrderProductFilled[], express = false) => {
	// console.log(products.map(p => p.product.quantity))
	if (products.some(p => p.product.quantity == 0))
		throw new Error(`product ${products.find(p => p.product.quantity == 0)?.product.productName} is out of stock, please remove it from the cart.`)
	
	validateOrderProductFilledList(products)

	const emptyProducts: OrderProduct[] = products.map(p => ({ ...p, product: undefined }))
	const response = await fetch(`/api/paypal/createorder`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ products: emptyProducts, express } as createOrderProps)
	})

	const { res, err } = await response.json() as apiResponse<createOrderRes, unknown>
	if (response.ok) {
		if (!res) throw new Error("This code should not be reachable, since response.ok is true")
		if (res.orderStatus == "COMPLETED") throw new Error("REQUEST ID HAS BEEN USED")
		if (!res.redirect_link) throw new Error("Redirect Link could not be found")
		return Object.assign(res, { redirect_link: res.redirect_link })
	}
	else throw err
}