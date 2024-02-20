// ui
import "styles/tailwind.css"
import 'tippy.js/dist/tippy.css'
import 'react-toastify/dist/ReactToastify.min.css'
import NavBar from 'components/navbar'
import { ToastContainer, Slide } from 'react-toastify'
import { ibmFont, jostFont, bitterFont } from 'util/ui/fonts'
import { DEVENV } from 'types/env'
// redux
import Redux from "./redux"

export const metadata = {
	title: {
		template: "%s | JHY Electrical",
		default: "JHY Electrical"
	}
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
				<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
				<link rel="manifest" href="/favicon/site.webmanifest" />
				<link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5" />
				<link rel="shortcut icon" href="/favicon/favicon.ico" />
				<meta name="msapplication-TileColor" content="#da532c" />
				<meta name="msapplication-config" content="/favicon/browserconfig.xml" />
				<meta name="theme-color" content="#ffffff" />
			</head>
			<body className={`${ibmFont.variable} ${jostFont.variable} ${bitterFont.variable} font-sans`}>
				<Redux>
					{/* <CartInitialFiller /> */}
					<ToastContainer autoClose={DEVENV ? 2000 : 4000} transition={Slide} />
					<NavBar />
					{children}
				</Redux>
			</body>
		</html>
	)
}