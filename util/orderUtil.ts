import { EmptyOrderInterface, FirebaseOrderInterface, OrderInterface, OrderProduct, OrderProductFilled } from "types/order"
import { getProductByID } from "./productUtil"

export const fillOrder = async (preOrder: EmptyOrderInterface, orderID: string): Promise<OrderInterface> => ({
	...preOrder,
	date: preOrder.dateTS.toDate(),
	firebaseOrderID: orderID,
	products: await fillOrderProducts(preOrder.products)
})

export const UnserializeOrder = (preOrder: FirebaseOrderInterface, orderID: string): OrderInterface => ({
	...preOrder,
	date: preOrder.dateTS.toDate(),
	firebaseOrderID: orderID,
})

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