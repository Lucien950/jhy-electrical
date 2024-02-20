import { CompletedOrderInterface, OrderInterface, OrderProduct } from "types/order"
import { flattenProductVariant, getProductByID } from "../product"

// export const fillOrder = async (preOrder: BaseOrderInterface, orderID: string): Promise<OrderInterface> => ({
// 	...UnserializeOrder(preOrder, orderID),
// 	products: await fillOrderProducts(preOrder.products)
// })


export function UnserializeOrder(preOrder: CompletedOrderInterface, orderID: string): OrderInterface;
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