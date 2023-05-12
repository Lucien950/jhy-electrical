import Link from "next/link"

const linkBoxes = ({ onclick }: { onclick?: () => void }) => {
	return (
		<div className="flex flex-col md:flex-row gap-x-2 mx-2 md:mx-8 my-2 gap-y-2 mb-6">
			<Link onClick={onclick} href="/products" className="block flex-1 focus:ring-4 outline-none rounded-t-2xl md:rounded-tr-md md:rounded-l-2xl rounded-md overflow-hidden">
				<div className="p-4 h-72 md:h-80 flex flex-col justify-end relative overflow-hidden text-white group">
					<img src="./home_products.jpg" alt="" className="absolute top-0 left-0 w-full h-full object-cover z-[-1] brightness-50 group-hover:brightness-75 transition-[filter]" />
					<h2 className="font-bold text-4xl mb-2">Products</h2>
					<ul className="list-disc list-inside">
						<li>Purchase light fixtures</li>
					</ul>
				</div>
			</Link>

			<Link onClick={onclick} href="/services" className="block flex-1 focus:ring-4 outline-none rounded-b-2xl md:rounded-bl-md md:rounded-r-2xl rounded-md overflow-hidden">
				<div className="p-4 h-72 md:h-80 flex flex-col justify-end relative overflow-hidden text-white group">
					<img src="./home_services.jpg" alt="" className="absolute top-0 left-0 w-full h-full object-cover z-[-1] brightness-50 group-hover:brightness-75 transition-[filter]" />
					<h2 className="font-bold text-4xl mb-2">Services</h2>
					<ul className="list-disc list-inside">
						<li>Quality work for low prices</li>
						<li>Install lights in your business</li>
					</ul>
				</div>
			</Link>
		</div>
	);
}

export default linkBoxes;