// react
import type { AppProps } from 'next/app'
import { useEffect, useState } from "react"
import { useRouter } from 'next/router'
// ui
import "styles/tailwind.css"
import 'tippy.js/dist/tippy.css'
import 'react-toastify/dist/ReactToastify.min.css'
import NavBar from 'components/navbar'
import { motion, AnimatePresence } from "framer-motion"
import { ToastContainer, Slide } from 'react-toastify'
import { ibmFont, jostFont, bitterFont } from 'util/fonts'
// redux
import { Provider, useDispatch, useSelector } from 'react-redux'
import store from 'util/redux/store'
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
const persistor = persistStore(store);
// firebase
import { getProductByID } from "util/productUtil";
import { cartFillProducts } from "util/redux/cart.slice";
import { OrderProduct } from "types/order"
import { firebaseConsoleBadge } from 'util/firebase/console'

import "util/firebase/emulator"
import { DEVENV } from 'util/env'

// dispatch here in order to be inside the provider
const CartInitialFiller = ()=>{
	const dispatch = useDispatch()
	const cart = useSelector((state: { cart: OrderProduct[] }) => state.cart) as OrderProduct[]
	const [initialFilled, setInitialFilled] = useState(false)
	useEffect(() => {
		if (initialFilled) return
		console.log(...firebaseConsoleBadge, 'Cart Snapshot Update', cart);
		setInitialFilled(true)
		const newProductsPromise = cart.map(async p => ({
			PID: p.PID,
			product: await getProductByID(p.PID).catch(() => null)
		}))
		Promise.all(newProductsPromise)
			.then(newProducts =>{ dispatch(cartFillProducts(newProducts)) })
	}, [cart]) //eslint-disable-line react-hooks/exhaustive-deps
	return <></>
}

export default function App({ Component, pageProps }: AppProps) {
	const { pathname } = useRouter();

	const variants = { out: { opacity: 0, }, in: { opacity: 1, } }
	const transition = { duration: 0.3 }

	return (
	<main className={`${ibmFont.variable} ${jostFont.variable} ${bitterFont.variable} font-sans`}>
	<Provider store={store}>
	<PersistGate persistor={persistor}>
	<CartInitialFiller />
	<NavBar />
	<ToastContainer autoClose={DEVENV ? 2000 : 4000} transition={Slide}/>
	<AnimatePresence
		initial={false}
		mode = "wait"
	>
		<motion.div
			variants={variants}
			transition={transition}
			animate="in"
			initial="out"
			exit="out"
			key={pathname}
		>
			<Component {...pageProps} />
		</motion.div>
	</AnimatePresence>
	</PersistGate>
	</Provider>
	</main>
)}
