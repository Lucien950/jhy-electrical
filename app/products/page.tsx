// next
import Image from "next/image"

// get products
import { Metadata } from "next";
import Listings from "./listings";

export const metadata: Metadata = {
	title: "Products | JHY Electrical"
}
export default function Products() {
	return (
		<div>
			{/* banner */}
			<div className="relative h-[28rem] select-none pointer-events-none -z-10">
				<div className="h-[106%] overflow-hidden relative">
					<Image src="/product_2.webp" alt="" className="object-cover brightness-50" fill
						style={{
							objectPosition: "center 25%"
						}} />
				</div>

				{/* TEXT, outside width limiter, inside */}
				<div className="container mx-auto">
					<h1 className="absolute bottom-[0.6rem] pl-2 lg:pl-4 text-6xl md:text-8xl font-bold drop-shadow-md select-text pointer-events-auto text-white">
						Products 
					</h1>
				</div>
			</div>
			<Listings />
		</div>
	);
}