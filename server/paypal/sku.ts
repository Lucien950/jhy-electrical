const SKUDELIMIT = "<-|->"

export const encodePayPalSKU = (productID: string, variantID: string) => {
	return `${productID}${SKUDELIMIT}${variantID}`
}

export const decodePayPalSKU = (sku: string) => {
	const arrSplit = sku.split(SKUDELIMIT)
	if (arrSplit.length != 2) throw new Error("Invalid SKU")
	const [productID, variantID] = arrSplit
	return {
		productID,
		variantID
	}
}