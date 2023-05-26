import { createSlice } from '@reduxjs/toolkit';
import { OrderProduct, OrderProductFilled } from 'types/order';
import { ProductInterface } from "types/product"

const cartSlice = createSlice({
	name: 'cart',
	initialState: [] as OrderProduct[],
	reducers: {
		addToCart: (state, action) => {
			const { PID, product, quantity = 1 } = action.payload as OrderProduct

			const itemExists = state.find((item) => item.PID === PID);
			if (itemExists) {
				itemExists.quantity += quantity;
				return
			}
			state.push({ PID, quantity, product });
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
			if(index >= 0) state.splice(index, 1);
		},
		clearCart: (state) => {
			return []
		},
		cartFillProducts: (state, action)=>{
			// return action.payload
			const products = action.payload as {PID: string, product: ProductInterface}[]
			products.forEach(p=>{
				const changeProduct = state.find(productInfo=>productInfo.PID == p.PID)
				if (changeProduct) changeProduct.product = p.product
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