import "../styles/tailwind.css"
import type { AppProps } from 'next/app'

import Head from 'next/head'
import { useRouter } from 'next/router'

import NavBar from '../components/navbar'
import { motion, AnimatePresence } from "framer-motion"
import { ParallaxProvider } from 'react-scroll-parallax'

import { Provider } from 'react-redux'
import store from '../util/redux/store'
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
const persistor = persistStore(store);

export default function App({ Component, pageProps }: AppProps) {
	const variants = {
		out: {
			opacity: 0,
			transition: { duration: 0.3 }
		},
		in: {
			opacity: 1,
			transition: { duration: 0.3, delay: 0.3 }
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
