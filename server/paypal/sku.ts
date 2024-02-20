const SKU_DELIMIT = "<-|->"

export const encodeProductVariantPayPalSku = (productID: string, variantID: string) => {
	return `${productID}${SKU_DELIMIT}${variantID}`
}

export const decodeProductVariantPayPalSku = (sku: string) => {
	const arrSplit = sku.split(SKU_DELIMIT)
	if (arrSplit.length != 2) throw new Error("Invalid SKU")
	const [productID, variantID] = arrSplit
	return {
		productID,
		variantID
	}
}