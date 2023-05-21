import { CommercialIcon, IndustrialIcon, ResidentialIcon } from "components/categoryIcons";
import commercial from "public/commercial.webp"
import breaker from "public/breakers.webp"

import Head from "next/head";

export default function Services() {
	return (
		<>
			<Head>
				<title>Services | JHY Electrical</title>
			</Head>
			{/* TOP */}
			<div className="mt-14 md:mt-0 md:grid grid-cols-12 bg-slate-800 pb-10">
				<div className="col-span-6 grid place-items-center">
					<h1 className="font-semibold text-7xl md:text-8xl leading-none md:ml-14 text-white">JHY Electrical Services</h1>
				</div>
				<img src="services.webp" alt="" className="col-span-4 h-[50rem] object-cover" />
			</div>

			{/* MISSION BANNER */}
			<div className="grid place-items-center py-10">
				<div className="bg-gray-100 py-12 px-20 rounded-xl drop-shadow-md">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-20">
						<path d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z" />
					</svg>
					<h2 className="ml-16 text-6xl font-bold">
						Our mission is to provide you<br />
						with a <span className="underline">quality contract</span></h2>

					<div className="flex flex-row justify-between items-center mt-6">
						<p className="ml-16 font-semibold text-xl">- _NAME_, from JHY Electrical</p>
						<div className="flex flex-row">
						<img className="rounded-full object-cover h-20 w-20 border-2 border-slate-700 pointer-events-none select-none mr-[-1rem]" src="https://media.istockphoto.com/id/1386479313/photo/happy-millennial-afro-american-business-woman-posing-isolated-on-white.jpg?s=612x612&w=0&k=20&c=8ssXDNTp1XAPan8Bg6mJRwG7EXHshFO5o0v9SIj96nY=" alt="" />
						<img className="rounded-full object-cover h-20 w-20 border-2 border-slate-700 pointer-events-none select-none" src="https://thumbs.dreamstime.com/b/headshot-african-american-male-glasses-posing-studio-portrait-smiling-man-wearing-casual-clothes-look-camera-image-153874435.jpg" alt="" />
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto">
				{/* Sectors */}
				<h2 className="text-center text-5xl font-bold mb-4">Sectors</h2>
				<p className="text-center text-lg">JHY Electrical Contracting offers an array of electrical services for residential and commercial projects of any size and scope.</p>
				<div className="flex flex-col md:flex-row justify-center gap-x-20 gap-y-8 my-10">
					<div className="flex-1">
						<div className="flex items-center gap-x-4 mb-4">
							{<ResidentialIcon className="w-12 h-12" />}
							<h3 className="font-bold text-xl">Residential</h3>
						</div>
						<p>Ihor and his team tackled the projects with great professionalism and creativity. They understood our brand value and turned this into excellent slide designs. The process was seamless and very effective, so we decided to roll this out across all our presentation decks. Furthermore, their understanding, professionalism, and creativity have secured a continued partnership.</p>
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-x-4 mb-4">
							{<IndustrialIcon className="w-12 h-12" />}
							<h3 className="font-bold text-xl">Industrial</h3>
						</div>
						<p>Ochi has an impressive understanding of what&apos;s needed to do an effective presentation. The stakeholders at work said it&apos;s the best most complete PP template they&apos;ve ever seen. Ochi delivered more than I was expecting and we were really surprised with the quality of his work. Will work with Ochi design again for sure!</p>
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-x-4 mb-4">
							{<CommercialIcon className="w-12 h-12" />}
							<h3 className="font-bold text-xl">Commercial</h3>
						</div>
						<p>This is just a great experience for us! As an established company, you operate within different industries and expect immediate input with a certain level of service. Ihor and the team delivered exactly that. Fantastic result, quick delivery time, and highly responsive. This team is a hidden gem. We&apos;ve already started to outline our next projects for them.</p>
					</div>
				</div>

				{/* Specialty */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-4 md:mb-20">
					<div className="h-[30rem] bg-cover bg-center" style={{ backgroundImage: `url(${breaker.src})` }}></div>
					<div className="flex flex-col gap-y-6">
						<p className="text-3xl">Our specialty is residential services for older homes, aluminum wiring replacement, upgrades to electrical service panels, assistance with renovations and new builds.</p>
						<div className="bg-cover bg-bottom flex-1" style={{ backgroundImage: `url(${commercial.src})` }}></div>
					</div>
				</div>

				{/* Licencing */}
				<div className="mb-10">
					<div className="flex flex-col md:flex-row items-center justify-around max-w-4xl mx-auto my-10">
						<img src="erca.svg" alt="" className="h-24 max-w-[50%]" />
						<img src="esa.svg" alt="" className="h-24 max-w-[50%]" />
					</div>
					<p className="text-medium text-center">We are proud to be licensed by the ECRA/ESA to offer residential andcommercial services in the Ottawa Area and with a full team of qualified electricians.</p>
				</div>
			</div>

			{/* CALL TO ACTION */}
			<div className="text-white bg-zinc-900">
				<div className="grid grid-cols-1 md:grid-cols-3 px-4 md:px-16 py-10 md:py-24 gap-y-4 container mx-auto">
					<div className="col-span-2">
						<h1 className="text-4xl">Call for a <span className="text-green-500">FREE Estimate</span></h1>
						<h1 className="text-7xl"><a href="tel:6135191650" className="link">613-355-2788</a></h1>
					</div>
					<div className="text-xl">
						<h1 className="font-bold mb-1">Email</h1>
						<p><a href="mailto:wei201108@gmail.com" className="link">wei201108@gmail.com</a></p>
						<h1 className="font-bold mb-1 mt-4">Address</h1>
						<p>5477 Cedar Dr. Manotick, ON K4M1B4</p>
					</div>
				</div>
			</div>
		</>
	);
}