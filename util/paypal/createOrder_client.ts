import { createOrderProps, createOrderRes } from "pages/api/paypal/createorder"
import { OrderProduct, OrderProductFilled, validateOrderProductFilledList, validateOrderProductFilledListError } from "types/order"
import { apiResponse } from "server/api"
import { clientErrorFactory } from "util/paypal/clientErrorFactory"

const createOrderError = clientErrorFactory("Create Order Link Server Error: Check console for more information")
/**
 * Function against local paypal API endpoint
 * @param amount Amount of money to pay
 * @returns object of type createOrderAPIReturn
 */
export const createPayPalOrder = async (products: OrderProductFilled[], express = false) => {

	console.log(products.map(p => p.product.quantity))
	if (products.some(p => p.product.quantity == 0))
		throw new Error(`product ${products.find(p => p.product.quantity == 0)?.product.productName} is out of stock, please remove it from the cart.`)
	if (!validateOrderProductFilledList(products)) return createOrderError(validateOrderProductFilledListError(products))

	const emptyProducts: OrderProduct[] = products.map(p => ({ ...p, product: undefined }))
	const response = await fetch(`/api/paypal/createorder`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ products: emptyProducts, express } as createOrderProps)
	})

	const { res, err } = await response.json() as apiResponse<createOrderRes, any>
	if (response.ok) {
		if (!res) return createOrderError("This code should not be reachable, since response.ok is true")
		if (res.orderStatus == "COMPLETED") return createOrderError("REQUEST ID HAS BEEN USED")
		if (!res.redirect_link) return createOrderError("Redirect Link could not be found")
		return Object.assign(res, { redirect_link: res.redirect_link })
	}
	else return createOrderError(err)
}