import Link from "next/link"
import Image from 'next/image';

const linkBoxes = ({ onClick }: { onClick?: () => void }) => (
	<div className="mx-2 md:mx-8 my-2 mb-6">
		<div className="flex flex-col md:flex-row gap-x-2 gap-y-2 overflow-hidden rounded-2xl">
			<Link onClick={onClick} href="/products" className="block flex-1 focus:ring-4 outline-none rounded-md overflow-hidden">
				<div className="p-4 h-72 md:h-80 flex flex-col justify-end relative text-white group">
					<Image fill src="/home_products.jpg" alt="" className="object-cover z-[-1] brightness-50 group-hover:brightness-75 transition-[filter]" />
					<h2 className="font-bold text-4xl mb-2">Products</h2>
					<ul className="list-disc list-inside">
						<li>Purchase light fixtures</li>
					</ul>
				</div>
			</Link>

			<Link onClick={onClick} href="/services" className="block flex-1 focus:ring-4 outline-none rounded-md overflow-hidden">
				<div className="p-4 h-72 md:h-80 flex flex-col justify-end relative text-white group">
					<Image fill src="/home_services.jpg" alt="" className="object-cover z-[-1] brightness-50 group-hover:brightness-75 transition-[filter]" />
					<h2 className="font-bold text-4xl mb-2">Services</h2>
					<ul className="list-disc list-inside">
						<li>Quality work for low prices</li>
						<li>Install lights in your business</li>
					</ul>
				</div>
			</Link>
		</div>
	</div>
)

export default linkBoxes;