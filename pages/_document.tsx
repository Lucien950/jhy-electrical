import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
	return (
		<Html>
			<Head>
				<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@100;300;500;600;700&display=swap" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bitter:wght@100;300;500;700;900&display=swap" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}