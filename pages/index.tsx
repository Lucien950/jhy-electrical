import Head from "next/head"
import LinkBoxes from "components/linkBoxes"
import Image from "next/image"

export default function Home() {
	return (
		<>
		<Head>
			<title>Home | JHY Electrical</title>
		</Head>
		<div className="bg-slate-800 relative z-[2] py-8 pt-32">
			<h1 className="whitespace-nowrap text-5xl md:text-6xl lg:text-9xl font-semibold text-white text-center mb-12"> JHY ELECTRICAL </h1>
			<div className="h-96 lg:h-[30rem] w-full relative">
				<Image src="/home_splash.webp" fill className="object-cover" alt="Splash Screen"/>
			</div>
		</div>

		<LinkBoxes />
		</>
	)
}
