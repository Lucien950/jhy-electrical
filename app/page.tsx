import Image from "next/image"
import LinkBoxes from "components/linkBoxes"

export const metadata = {
	title: "JHY Electrical",
	description: "JHY Electrical is a family run business that has been providing electrical services to the local community for over 20 years. We pride ourselves on our high quality workmanship and excellent customer service.",
}

export default function Home() {
	return (
		<div>
			<div className="bg-slate-800 relative z-[2] py-8 pt-32">
				<h1 className="whitespace-nowrap text-5xl md:text-6xl lg:text-9xl font-semibold text-white text-center mb-12 tracking-tighter leading-none"> JHY ELECTRICAL </h1>
				<div className="h-96 lg:h-[30rem] w-full relative">
					<Image src="/home_splash.webp" fill className="object-cover" alt="Splash Screen" priority />
				</div>
			</div>
			<div className="max-w-7xl mx-auto px-2 py-4">
				<LinkBoxes />
			</div>
		</div>
	)
}