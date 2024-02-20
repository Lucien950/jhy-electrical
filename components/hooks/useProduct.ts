import { useEffect, useState } from "react"
import { OrderProduct } from "types/order"
import { ProductVariantInterface } from "types/product"
import { getProductVariant } from "util/product"


/**
 * Given an order product, this hook will fetch the underlying product data
 * @param orderProduct
 * @returns Product data, and whether the product is fetching.
 */
export const useProduct = (orderProduct: OrderProduct) => {
	const [productLoading, setProductLoading] = useState(true)
	const [product, setProduct] = useState<ProductVariantInterface | null>(null)
	useEffect(() => {
		setProductLoading(true)
		getProductVariant(orderProduct.PID, orderProduct.variantSKU).then(p=> {
			setProduct(p)
			setProductLoading(false)
		})
	}, []) // eslint-disable-line react-hooks/exhaustive-deps
	return {product, productLoading}
}