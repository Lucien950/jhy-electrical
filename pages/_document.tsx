import { Html, Head, Main, NextScript } from 'next/document'
import { ibmFont, jostFont, bitterFont } from 'util/fonts'

export default function Document() {
	return (
		<Html>
			<Head>
				{/* <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" /> */}
				<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
				<link rel="manifest" href="/favicon/site.webmanifest" />
				<link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5" />
				<link rel="shortcut icon" href="/favicon/favicon.ico" />
				<meta name="msapplication-TileColor" content="#da532c" />
				<meta name="msapplication-config" content="/favicon/browserconfig.xml" />
				<meta name="theme-color" content="#ffffff" />
			</Head>
			{/* this very hacky but no other solutions? raw loading without app loading is not ok? */}
			<body className={`${ibmFont.variable} ${jostFont.variable} ${bitterFont.variable} font-sans`}>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}