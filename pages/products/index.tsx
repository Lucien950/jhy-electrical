// next
import Link from "next/link";
import Head from "next/head";
import { MouseEventHandler, useEffect, useState } from "react";
// types
import productType from "types/product";
// UI
import { Residential, Industrial, Commercial, ResidentialIcon, IndustrialIcon, CommercialIcon } from "components/categoryIcons";
import seedRandom from "seedrandom";
import { motion } from "framer-motion";
import Price from "components/price";

// get products
import { getAllProducts } from "util/fillProduct";

const ProductItem = ({ product }: {product: productType})=>{
	const backgroundColours = ["bg-blue-200", "bg-neutral-300", "bg-zinc-800", "bg-lime-900"]
	const backgroundColour = backgroundColours[Math.round(seedRandom(product.firestoreID)() * 3)]
	return(
		<motion.div layout>
			<Link href={`products/${product.firestoreID}`}>
				<div className={`grid place-items-center py-10 lg:py-20 mb-2 lg:mb-6 group ${backgroundColour}`}>
					<img src={product.productImageURL} alt="" className="h-32 group-hover:scale-105 transition-transform"/>
				</div>
			</Link>

			<div className="flex flex-row justify-between">
				<div>
					<Link href={`products/${product.firestoreID}`}>
					<h1 className="font-bold text-xl mb-2 leading-none">
						{product.productName}
					</h1>

					{/* price */}
					<Price price={product.price}/>
					</Link>
				</div>
				<div className="flex flex-row gap-x-3 items-center">
					{product.residential && <Residential />}
					{product.industrial && <Industrial />}
					{product.commercial && <Commercial />}
				</div>
			</div>
		</motion.div>
	)
}

const Products = () => {
	const [filter, setFilter] = useState({
		residential: false,
		industrial: false,
		commercial: false
	})
	const [products, setProducts] = useState([] as productType[])
	const [displayProducts, setDisplayProducts] = useState([] as productType[])

	const handleFilter: MouseEventHandler<HTMLButtonElement> = (e)=>{
		const property = (e.target as HTMLInputElement).id as "residential" | "industrial" | "commercial"
		setFilter({...filter, [property]: !filter[property]})
	}

	useEffect(()=>{
		getAllProducts().then(newProducts => {
			setProducts(newProducts)
		})
	}, [])
	useEffect(()=>{
		setDisplayProducts(products)
	}, [products])
	useEffect(()=>{
		if(!Object.values(filter).some(p=>p)) setDisplayProducts(products)
		else setDisplayProducts(products.filter(p => p.residential && filter.residential || p.commercial && filter.commercial || p.industrial && filter.industrial))
	}, [filter])

	return (
		<>
			<Head>
				<title>Products | JHY Electrical</title>
			</Head>
			{/* banner */}
			<div className="relative h-[28rem] select-none pointer-events-none -z-10">
				<div className="h-[106%] overflow-hidden relative">
					<img
						className="w-full object-cover max-h-[200%] h-[120%]"
						style={{clipPath:"inset(0)"}}
						src="/product_2.webp"
						alt=""
					/>
				</div>

				{/* TEXT, outside width limiter, inside */}
				<div className="container mx-auto">
					<h1
						className="absolute bottom-[0.5rem]
						text-6xl md:text-8xl font-bold drop-shadow-md select-text pointer-events-auto"
					>
						Products
					</h1>
				</div>
			</div>

			{/* product grid */}
			<div className="container mx-auto">
				<div className="bg-white p-2 lg:p-4 flex flex-row flex-wrap gap-y-2 items-center gap-x-2 sm:mb-6 sm:shadow-lg lg:w-5/6 mx-auto">
					<svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
					<button className={`flex flex-row items-center gap-x-2 py-2 px-3 border-2 rounded-full leading-none transition-colors duration-75 hover:bg-blue-200 hover:border-blue-300 ${filter.residential && "bg-blue-500 border-blue-600 text-white fill-white"}`} onClick={handleFilter} id="residential">
						{<ResidentialIcon className="w-8 h-8"/>}
						Residential
					</button>
					<button className={`flex flex-row items-center gap-x-2 py-2 px-3 border-2 rounded-full leading-none transition-colors duration-75 hover:bg-blue-200 hover:border-blue-300 ${filter.industrial && "bg-blue-500 border-blue-600 text-white fill-white"}`} onClick={handleFilter} id="industrial">
						{<IndustrialIcon className="w-8 h-8"/>}	
						Industrial
					</button>
					<button className={`flex flex-row items-center gap-x-2 py-2 px-3 border-2 rounded-full leading-none transition-colors duration-75 hover:bg-blue-200 hover:border-blue-300 ${filter.commercial && "bg-blue-500 border-blue-600 text-white fill-white"}`} onClick={handleFilter} id="commercial">
						{<CommercialIcon className="w-8 h-8"/>}
						Commercial
					</button>
				</div>

				<motion.div
					className="
						grid
						md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4
						lg:gap-x-2 2xl:gap-x-4 gap-y-6
					"
					layout
				>
					{displayProducts.map((product)=>
						<ProductItem product={product} key={product.firestoreID}/>
					)}
				</motion.div>
			</div>
		</>
	);
}

export default Products;