import Head from "next/head"
import LinkBoxes from "components/linkBoxes"

export default function Home() {
	return (
		<>
		<Head>
			<title>Home | JHY Electrical</title>
		</Head>
		<div className="bg-slate-800 relative z-[2] py-8 pt-32">
			<h1 className="whitespace-nowrap text-6xl lg:text-9xl font-semibold text-white text-center mb-12"> JHY ELECTRICAL </h1>
			<img src="/home_splash.jpg" alt="" className="h-96 lg:h-[30rem] w-full object-cover"/>
		</div>

		<LinkBoxes />
		</>
	)
}
