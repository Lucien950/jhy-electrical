import { createSlice } from '@reduxjs/toolkit';
import { OrderProduct, OrderProductFilled } from 'types/order';
import { ProductInterface } from "types/product"

const cartSlice = createSlice({
	name: 'cart',
	initialState: [] as OrderProductFilled[],
	reducers: {
		addToCart: (state, action: { payload: OrderProductFilled }) => {
			const { PID, product, variantSKU, quantity = 1 } = action.payload

			const foundItem = state.find((item) => item.PID === PID && item.variantSKU === variantSKU);
			if (foundItem) foundItem.quantity += quantity
			else state.push({ PID, quantity, variantSKU, product })
		},
		setQuantity: (state, action: { payload: OrderProduct }) => {
			const { PID, variantSKU, quantity } = action.payload

			const item = state.find((item) => item.PID === PID && item.variantSKU === variantSKU);
			if (!item) throw new Error(`Item ${PID} with sku ${variantSKU} does not exist in cart`)

			// remove element if it has 0 quantity
			if (quantity === 0) state.splice(state.findIndex((item) => item.PID === PID), 1);
			else item.quantity = quantity;
		},
		removeFromCart: (state, action: { payload: string }) => {
			const PID = action.payload
			const index = state.findIndex(item => item.PID === PID);
			if (index >= 0) state.splice(index, 1);
		},
		clearCart: (state) => [],
		cartFillProducts: (state, action: { payload: { PID: string, product: ProductInterface | null }[] }) => {
			// return action.payload
			const products = action.payload
			products.forEach(p => {
				if (p.product === null) return
				const { variants, ...noVariantsProduct } = p.product
				const changeProducts = state.filter(productInfo => productInfo.PID == p.PID)
				changeProducts.forEach((changeProduct) => {
					const productVariant = variants.find(v => v.sku == changeProduct.variantSKU)
					if (!productVariant) throw new Error(`Variant ${changeProduct.variantSKU} does not exist`)
					changeProduct.product = { ...noVariantsProduct, ...productVariant }
				})
			})
			console.log("cart filled products")
		}
	},
});

export const cartReducer = cartSlice.reducer;
export const {
	addToCart,
	setQuantity,
	removeFromCart,
	clearCart,
	cartFillProducts
} = cartSlice.actions;