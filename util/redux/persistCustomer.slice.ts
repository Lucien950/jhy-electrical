import { createSlice } from '@reduxjs/toolkit';
import customer from 'types/customer';

const persistCustomerSlice = createSlice({
	name: 'persistCustomer',
	initialState: {} as customer,
	reducers: {
		setPersistCustomer: (state, action)=>{
			const newCustomer = action.payload
			return newCustomer
		},
		removePersistCustomer: ()=>{
			return {} as customer
		}
	},
});

export const persistCustomerReducer = persistCustomerSlice.reducer;

export const {
	setPersistCustomer,
	removePersistCustomer
} = persistCustomerSlice.actions;