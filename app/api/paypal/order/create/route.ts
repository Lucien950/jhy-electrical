// types
import { calculatePrice } from 'server/price';
import { fillOrderProducts } from 'util/order';
import { createOrderAPICall } from 'app/api/paypal/order/createOrderFetch';
import { apiHandler } from 'server/api';
import { attemptCreateOrderProps, createOrderRes } from '.';
/**
 * Create Order API Endpoint
 */
async function createOrderHandler(req: Request): Promise<createOrderRes> {
	// INPUTS
	const { products: orderProducts, express = false } = attemptCreateOrderProps(await req.json())
	// fill products
	const products = await fillOrderProducts(orderProducts) //this validates that all products are valid
	if (!products.every(orderProduct => orderProduct.quantity <= orderProduct.product.quantity))
		throw new Error("Not enough stock for one of the products")
	const paymentInformation = await calculatePrice(products)
	const order = await createOrderAPICall(paymentInformation, products, express)

	return {
		orderStatus: order.status,
		orderID: order.id!,
		// this must be present
		redirect_link: order.links?.find(l => l.rel == "approve")?.href || null,
	}
}

export const dynamic = 'force-dynamic'
export const POST = (req: Request) => apiHandler(req, createOrderHandler)