// react
import type { AppProps } from 'next/app'
import { useEffect, useState } from "react"
import { useRouter } from 'next/router'
// ui
import "styles/tailwind.css"
import 'tippy.js/dist/tippy.css'
import NavBar from 'components/navbar'
import { motion, AnimatePresence } from "framer-motion"
// redux
import { Provider, useDispatch, useSelector } from 'react-redux'
import store from 'util/redux/store'
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
const persistor = persistStore(store);
// firebase
import { fillProductDoc } from "util/fillProduct";
import { cartFillProducts } from "util/redux/cart.slice";
import { productInfo } from "types/order"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "util/firebase/firestore"

// dispatch here in order to be inside the provider
const CartUpdater = ()=>{
	const dispatch = useDispatch()
	const cart = useSelector((state: { cart: productInfo[] }) => state.cart) as productInfo[]
	const [isInitial, setIsInitial] = useState(true)
	useEffect(() => {
		console.log("Firebase Subscribe")
		const unsub = onSnapshot(collection(db, "products"), async (snapshot) => {
			const cartIds = cart.map(p => p.PID)

			const changedDocs = snapshot.docChanges().filter(d => {
				if (isInitial) {
					setIsInitial(false)
					return true
				}
				return d.type != "added"
			}).map(doc => doc.doc)
			const requiredProducts = await Promise.all(changedDocs.filter	(doc => cartIds.includes(doc.id)).map(fillProductDoc))
			dispatch(cartFillProducts(requiredProducts))
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
			<Component {...pageProps} />
		</motion.div>
	</AnimatePresence>
	</PersistGate>
	</Provider>
)}
