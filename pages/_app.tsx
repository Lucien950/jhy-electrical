import "../styles/tailwind.css"

import type { AppProps } from 'next/app'
import { useEffect } from "react"

import Head from 'next/head'
import { useRouter } from 'next/router'

import NavBar from '../components/navbar'
import { motion, AnimatePresence } from "framer-motion"

import { ParallaxProvider } from 'react-scroll-parallax'

import { Provider, useDispatch, useSelector } from 'react-redux'
import store from '../util/redux/store'
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
const persistor = persistStore(store);

import { getProductsByIDs } from "../util/fillProduct";
import { cartFillProducts } from "../util/redux/cart.slice";
import { productInfo } from "../types/order"
import { collection, onSnapshot } from "firebase/firestore"
import db from "../util/firebase/firestore"

const CartUpdater = ()=>{
	const dispatch = useDispatch()
	const cart = useSelector((state: { cart: productInfo[] }) => state.cart) as productInfo[]
	useEffect(() => {
		const unsub = onSnapshot(collection(db, "products"), () => {
			getProductsByIDs(cart.map(p => p.PID))
				.then(requiredProducts => {
					dispatch(cartFillProducts(requiredProducts))
				})
		})
		return unsub
	}, [])
	return <></>
}

export default function App({ Component, pageProps }: AppProps) {
	const variants = {
		out: {
			opacity: 0,
			transition: { duration: 0.3 }
		},
		in: {
			opacity: 1,
			transition: { duration: 0.3 }
		}
	}
	const { pathname } = useRouter();

	return (
	<>
		<Head>
			<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
		</Head	>
		<Provider store={store}>
		<PersistGate persistor={persistor}>
		<CartUpdater />
		<NavBar />
		<AnimatePresence
			initial={false}
			mode = "wait"
		>
			<motion.div
				variants={variants}
				animate="in"
				initial="out"
				exit="out"
				key={pathname}
			>
				<ParallaxProvider>
					<Component {...pageProps} />
				</ParallaxProvider>
			</motion.div>
		</AnimatePresence>
		</PersistGate>
		</Provider>
	</>
)}
