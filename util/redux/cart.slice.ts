import { createSlice } from '@reduxjs/toolkit';
import { OrderProduct } from 'types/order';

const cartSlice = createSlice({
	name: 'cart',
	initialState: [] as OrderProduct[],
	reducers: {
		addToCart: (state, action: { payload: OrderProduct }) => {
			const { PID, variantSKU, quantity = 1 } = action.payload

			const foundItem = state.find((item) => item.PID === PID && item.variantSKU === variantSKU);
			if (foundItem) foundItem.quantity += quantity
			else state.push({ PID, quantity, variantSKU })
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
		clearCart: () => [],
	},
});

export const cartReducer = cartSlice.reducer;
export const {
	addToCart,
	setQuantity,
	removeFromCart,
	clearCart,
} = cartSlice.actions;