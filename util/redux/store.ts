import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import {
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from 'redux-persist';

// my reducers
import { cartReducer } from './cart.slice';
import { persistCustomerReducer } from './persistCustomer.slice';

const persistConfig = {
	key: 'counter',
	storage,
};

const reducer = combineReducers({
	cart: cartReducer,
	persistCustomer: persistCustomerReducer
})
const persistedReducer = persistReducer(persistConfig, reducer);

const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export default store;