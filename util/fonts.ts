import { IBM_Plex_Sans, Jost, Bitter } from "@next/font/google"

export const ibmFont = IBM_Plex_Sans({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700"],
	variable: "--font-ibm-plex-sans",
})

export const jostFont = Jost({
	subsets: ["latin"],
	weight: ["700"],
	variable: "--font-jost",
})

export const bitterFont = Bitter({
	subsets: ["latin"],
	weight: ["200", "400", "700"],
	variable: "--font-bitter",
})
