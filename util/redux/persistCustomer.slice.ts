import { createSlice } from '@reduxjs/toolkit';
import CustomerInterface from 'types/customer';

const persistCustomerSlice = createSlice({
	name: 'persistCustomer',
	initialState: {} as CustomerInterface,
	reducers: {
		setPersistCustomer: (state, action)=>{
			const newCustomer = action.payload
			return newCustomer
		},
		removePersistCustomer: ()=>{
			return {} as CustomerInterface
		}
	},
});

export const persistCustomerReducer = persistCustomerSlice.reducer;

export const {
	setPersistCustomer,
	removePersistCustomer
} = persistCustomerSlice.actions;