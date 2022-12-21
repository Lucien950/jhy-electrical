import type { AppProps } from 'next/app'
import "../styles/tailwind.css"
import Head from 'next/head'
import NavBar from '../components/navbar'
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
	const variants = {
		out: {
			opacity: 0,
			transition: {
				duration: 0.3
			}
		},
		in: {
			opacity: 1,
			transition: {
				duration: 0.3,
				delay: 0.5
			}
		}
	}
	const { asPath } = useRouter();
	return (
	<>
		<Head>
			<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
		</Head	>
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
				key={asPath}
			>
				<Component {...pageProps} />
			</motion.div>
		</AnimatePresence>
	</>
)}
