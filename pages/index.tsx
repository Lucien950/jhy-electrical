import Head from "next/head"
import Link from "next/link"

export default function Home() {
return (
	<>
	<Head>
		<title>Home | JHY Electrical</title>
	</Head>
	<div className="bg-slate-800 relative z-[2] p-8 pt-32">
		<h1 className="whitespace-nowrap text-6xl lg:text-9xl font-black text-white text-center mb-12"> JHY ELECTRICAL </h1>
		<img src="/home_splash.jpg" alt="" className="h-96 lg:h-[30rem] w-full object-cover"/>
	</div>

	<div className="grid grid-rows-2 md:grid-rows-1 grid-cols-1 md:grid-cols-2 gap-x-2 mx-8 my-2 gap-y-2 rounded-2xl overflow-hidden">
		<Link href="/products">
			<div className="rounded-md p-4 h-96 flex flex-col justify-end relative overflow-hidden text-white group">
				<img src="./home_products.jpg" alt="" className="absolute top-0 left-0 w-full h-full object-cover z-[-1] brightness-50 group-hover:brightness-75 transition-[filter]"/>
				<h2 className="font-bold text-4xl mb-2">Products</h2>
				<ul className="list-disc list-inside">
					<li>Purchase light fixtures</li>
				</ul>
			</div>
		</Link>
		
		<Link href="/services">
				<div className="rounded-md p-4 h-96 flex flex-col justify-end relative overflow-hidden text-white group">
				<img src="./home_services.jpg" alt="" className="absolute top-0 left-0 w-full h-full object-cover z-[-1] brightness-50 group-hover:brightness-75 transition-[filter]"/>
				<h2 className="font-bold text-4xl mb-2">Services</h2>
				<ul className="list-disc list-inside">
					<li>Quality work for low prices</li>
					<li>Install lights in your business</li>
				</ul>
			</div>
		</Link>
	</div>
	</>
)}
