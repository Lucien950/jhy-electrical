"use client"
import { useEffect, useMemo, useState } from "react"
import { OrderProduct } from "types/order"
import { ProductWithVariant } from "types/product"
import { getProductVariant } from "util/product"
import { getDownloadURL, ref } from "firebase/storage"
import { storage } from "util/firebase/storage"

/**
 * Given an order product, this hook will fetch the underlying product data
 * @param orderProduct
 * @returns Product data, and whether the product is fetching.
 */
export function useProduct (op: OrderProduct)  {
	const [product, setProduct] = useState<ProductWithVariant | null>(null)
	const [productLoading, setProductLoading] = useState(true)
	const [productNotFound, setProductNotFound] = useState(false)
	useMemo(() => {
		setProductLoading(true)
		setProductNotFound(false)
		getProductVariant(op.PID, op.variantSKU)
			.then(p => setProduct(p))
			.catch(() => { setProductNotFound(true) })
			.finally(() => { setProductLoading(false) })
	}, [op.PID, op.variantSKU])
	return { product, productLoading, productNotFound }
}



export function useProductImageURL(url: string) {
	const [productImageURL, setProductImageURL] = useState<string | null>(null)
  useEffect(() => {
    getDownloadURL(ref(storage, `products/${url}`)).then(setProductImageURL)
  }, [])
	return productImageURL
}