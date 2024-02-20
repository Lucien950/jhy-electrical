import { CompletedOrder, Order, OrderProduct } from "types/order"
import { flattenProductVariant, getProductByID } from "../product"

export function UnserializeOrder(preOrder: CompletedOrder, orderID: string): Order;
export function UnserializeOrder(preOrder: any, orderID: string) {
	const { dateTS, ...rest } = preOrder
	return {
		...rest,
		date: preOrder.dateTS.toDate(),
		firebaseOrderID: orderID,
	}
}

export const fillOrderProducts = async (orderProductList: OrderProduct[]) =>
	await Promise.all(orderProductList.map(async (emptyProduct: OrderProduct) => ({
		...emptyProduct,
		product: await flattenProductVariant(await getProductByID(emptyProduct.PID), emptyProduct.variantSKU)
	})))