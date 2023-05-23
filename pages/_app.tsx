// react
import type { AppProps } from 'next/app'
import { useEffect } from "react"
import { useRouter } from 'next/router'
// ui
import "styles/tailwind.css"
import 'tippy.js/dist/tippy.css'
import NavBar from 'components/navbar'
import { motion, AnimatePresence } from "framer-motion"
import 'react-toastify/dist/ReactToastify.min.css'
import { ToastContainer, Slide } from 'react-toastify'

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

// dispatch here in order to be inside the provider
const CartUpdater = ()=>{
	const dispatch = useDispatch()
	const cart = useSelector((state: { cart: OrderProduct[] }) => state.cart) as OrderProduct[]
	useEffect(() => {
		console.log(...firebaseConsoleBadge, 'Cart Snapshot Updated');
		Promise.all(cart.map(async p => {
			if (p.product) return p
			return { ...p, product: await getProductByID(p.PID) }
		}))
		.then(newCart => dispatch(cartFillProducts(newCart)))
	}, [cart]) //eslint-disable-line react-hooks/exhaustive-deps
	return <></>
}

export default function App({ Component, pageProps }: AppProps) {
	const { pathname } = useRouter();

	const variants = { out: { opacity: 0, }, in: { opacity: 1, } }
	const transition = { duration: 0.3 }

	return (
	<Provider store={store}>
	<PersistGate persistor={persistor}>
	<CartUpdater />
	<NavBar />
	<ToastContainer autoClose={process.env.NODE_ENV === "development" ? 2000 : 4000} transition={Slide}/>
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
)}
