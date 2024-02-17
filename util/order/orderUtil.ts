import { BaseOrderInterface, FirebaseOrderInterface, OrderInterface, OrderProduct, OrderProductFilled, SerializedOrderInterface } from "types/order"
import { getProductByID } from "../product/productUtil"

export const fillOrder = async (preOrder: BaseOrderInterface, orderID: string): Promise<OrderInterface> => ({
	...UnserializeOrder(preOrder, orderID),
	products: await fillOrderProducts(preOrder.products)
})


export function UnserializeOrder(preOrder: FirebaseOrderInterface, orderID: string): OrderInterface;
export function UnserializeOrder(preOrder: BaseOrderInterface, orderID: string): SerializedOrderInterface;
export function UnserializeOrder(preOrder: any, orderID: string) {
	const { dateTS, ...rest } = preOrder
	return {
		...rest,
		date: preOrder.dateTS.toDate(),
		firebaseOrderID: orderID,
	}
}

export const fillOrderProducts = async (emptyProducts: OrderProduct[]): Promise<OrderProductFilled[]> =>
	await Promise.all(emptyProducts.map(async (emptyProduct: OrderProduct): Promise<OrderProductFilled> => {
		const { variants, ...productData } = await getProductByID(emptyProduct.PID)
		const selectedVariant = variants.find(v => v.sku == emptyProduct.variantSKU)
		if (!selectedVariant) throw new Error(`Variant ${emptyProduct.variantSKU} does not exist`)
		return {
			...emptyProduct,
			product: {
				...productData,
				...selectedVariant,
			}
		}
	}))