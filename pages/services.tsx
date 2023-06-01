import { CommercialIcon, IndustrialIcon, ResidentialIcon } from "components/categoryIcons";

import Head from "next/head";

import Image from "next/image";

export default function Services() {
	return (
		<>
			<Head>
				<title>Services | JHY Electrical</title>
			</Head>
			{/* TOP */}
			<div className="pt-24 md:pt-0 md:grid grid-cols-12 bg-slate-800 pb-10">
				<div className="col-span-6 grid place-items-center mb-6 md:mb-0">
					<h1 className="font-semibold text-6xl lg:text-8xl leading-none md:ml-14 text-white">JHY Electrical Services</h1>
				</div>
				<div className="col-span-4">
					<div className="h-[40rem] w-3/4 mx-auto md:h-[50rem] md:w-auto relative bg-red-500">
						<Image src="/services.webp" alt="" className="object-cover" fill priority/>
					</div>
				</div>
			</div>

			{/* MISSION BANNER */}
			<div className="py-10">
				<div className="bg-gray-100 py-8 px-6 md:py-12 md:px-16 w-4/5 max-w-[54rem] mx-auto rounded-xl drop-shadow-md">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-12 sm:w-20">
						<path d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z" />
					</svg>

					<div className="ml-4 sm:ml-16">
						<h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
							Our mission is to provide you<br />
							with a <span className="underline">quality contract</span></h2>

						<div className="flex flex-row justify-between items-center mt-6">
							<p className="font-semibold text-xl">- Wei from JHY Electrical</p>
							<div className="h-16 md:h-24 w-16 md:w-24 relative">
								<Image className="rounded-full object-cover shadow-md select-none" src="/wei_profile.webp" alt="Picture of Wei" fill />
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 mb-10 mt-4">
				{/* Sectors */}
				<h2 className="text-center text-5xl font-bold mb-4">Sectors</h2>
				<p className="text-center text-lg">JHY Electrical Contracting offers an array of electrical services for residential and commercial projects of any size and scope.</p>
				<div className="flex flex-col md:flex-row justify-center gap-x-20 gap-y-8 my-10">
					<div className="flex-1">
						<div className="flex items-center gap-x-4 mb-4">
							{<ResidentialIcon className="w-12 h-12" />}
							<h3 className="font-bold text-xl">Residential</h3>
						</div>
						<p>FILLER RESIDENTIAL</p>
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-x-4 mb-4">
							{<IndustrialIcon className="w-12 h-12" />}
							<h3 className="font-bold text-xl">Industrial</h3>
						</div>
						<p>FILLER INDUSTRIAL</p>
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-x-4 mb-4">
							{<CommercialIcon className="w-12 h-12" />}
							<h3 className="font-bold text-xl">Commercial</h3>
						</div>
						<p>FILLER COMMERCIAL</p>
					</div>
				</div>

				{/* Specialty */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-4 md:mb-20">
					<div className="h-[30rem] relative">
						<Image src="/breakers.webp" alt="Image of electrical breakers" className="object-cover object-center" fill/>
					</div>
					<div className="flex flex-col gap-y-6">
						<p className="text-3xl">Our specialty is residential services for older homes, aluminum wiring replacement, upgrades to electrical service panels, assistance with renovations and new builds.</p>
						<div className="flex-1 relative">
							<Image src="/commercial.webp" alt="Image of Commercial Worksite" className="object-cover object-bottom" fill/>
						</div>
					</div>
				</div>

				{/* Licencing */}
				<div>
					<div className="flex flex-col md:flex-row items-center justify-around max-w-4xl mx-auto my-10">
						<img src="erca.svg" alt="" className="h-24 max-w-[50%]" />
						<div className="max-w-[50%]">
							<img src="esa.svg" alt="" className="h-24" />
							<p className="font-semibold text-center mt-2 text-blue-700">ECRA/ESA #7013745</p>
						</div>
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