import { createSlice } from '@reduxjs/toolkit';
import { OrderProduct, OrderProductFilled } from 'types/order';
import { ProductInterface } from "types/product"

const cartSlice = createSlice({
	name: 'cart',
	initialState: [] as OrderProductFilled[],
	reducers: {
		addToCart: (state, action: { payload: OrderProductFilled }) => {
			const { PID, product, variantSKU, quantity = 1 } = action.payload

			const itemExists = state.find((item) => item.PID === PID && item.variantSKU === variantSKU);
			if (itemExists) {
				itemExists.quantity += quantity;
				return
			}
			state.push({ PID, quantity, variantSKU, product });
		},
		setQuantity: (state, action) => {
			const { PID, quantity } = action.payload as OrderProduct
			const item = state.find((item) => item.PID === PID);
			if (!item) return

			if (quantity === 0) {
				const index = state.findIndex((item) => item.PID === PID);
				state.splice(index, 1);
				return
			}
			item.quantity = quantity;
		},
		removeFromCart: (state, action) => {
			const { PID } = action.payload as OrderProduct
			const index = state.findIndex(item => item.PID === PID);
			if (index >= 0) state.splice(index, 1);
		},
		clearCart: (state) => {
			return []
		},
		cartFillProducts: (state, action) => {
			// return action.payload
			const products = action.payload as { PID: string, product: ProductInterface }[]
			products.forEach(p => {
				const changeProduct = state.find(productInfo => productInfo.PID == p.PID)
				if (changeProduct) {
					const { variants, ...product } = p.product
					const productVariant = variants.find(v => v.sku == changeProduct.variantSKU)
					if (!productVariant) throw new Error(`Variant ${changeProduct.variantSKU} does not exist`)
					changeProduct.product = {
						...product,
						...productVariant
					}
				}
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