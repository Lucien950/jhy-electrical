// next
import Link from "next/link";
import Head from "next/head";
import { useEffect, useState } from "react";
// types
import productType from "types/product";
// UI
import { Residential, Industrial, Commercial, ResidentialIcon, IndustrialIcon, CommercialIcon } from "components/categoryIcons";
import seedRandom from "seedrandom";
import { motion } from "framer-motion";
import Price from "components/price";

// get products
import { getAllProducts } from "util/productUtil";
import { JsxElement } from "typescript";

const ProductItem = ({ product }: {product: productType})=>{
	// const backgroundColours = ["bg-blue-200", "bg-neutral-300", "bg-zinc-800", "bg-lime-900"]
	const backgroundColours = ["bg-slate-800"]
	const backgroundColour = backgroundColours[Math.round(seedRandom(product.firestoreID)() * (backgroundColours.length - 1))]
	return(
		<motion.div layout>
			<Link href={`products/${product.firestoreID}`} className="block focus:ring-8 focus:outline-none rounded-lg">
			<div className={`grid place-items-center py-10 lg:py-20 mb-2 lg:mb-6 group ${backgroundColour} rounded-lg`}>
				<img src={product.productImageURL} alt="" className="h-32 group-hover:scale-105 transition-transform"/>
			</div>
			</Link>

			<div className="flex flex-row justify-between">
				<div>
					<Link href={`products/${product.firestoreID}`} tabIndex={-1}>
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

const FilterButton = ({isSelected, setFilterActive, children}: {children: any, isSelected: boolean, setFilterActive: ()=>void})=>{
	return(
		<button className={`flex flex-row items-center gap-x-2 py-2 px-4 border-4 rounded-full leading-none
			transition-colors duration-75 hover:bg-blue-200 hover:border-blue-300
			outline-none focus:ring-4
			${isSelected && "bg-blue-400 border-blue-500 text-white fill-white"}`}
			onClick={setFilterActive} id="residential"
		>
			{children}
		</button>
	)
}

type handleFilterFunc = (property: "residential" | "industrial" | "commercial") => void
const Products = () => {
	const [filter, setFilter] = useState({
		residential: false,
		industrial: false,
		commercial: false
	})
	const [products, setProducts] = useState([] as productType[])
	const [displayProducts, setDisplayProducts] = useState([] as productType[])

	const handleFilter: handleFilterFunc = (property)=>{
		setFilter({...filter, [property]: !filter[property]})
	}


	// TODO pagination and filtering?
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
						className="w-full object-cover max-h-[200%] h-[120%] brightness-50"
						style={{clipPath:"inset(0)"}}
						src="/product_2.jpg"
						alt=""
					/>
				</div>

				{/* TEXT, outside width limiter, inside */}
				<div className="container mx-auto">
					<h1
						className="absolute bottom-[0.6rem]
						text-6xl md:text-8xl font-bold drop-shadow-md select-text pointer-events-auto text-white"
					> Products </h1>
				</div>
			</div>

			{/* product grid */}
			<div className="container mx-auto pb-16">
				<div className="bg-white flex flex-row flex-wrap gap-y-2 items-center gap-x-2 p-2 lg:p-4 sm:mb-6 mx-auto rounded-md sm:sticky top-[80px] z-10 sm:shadow-lg" >
					{/* funnel */}
					<svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
					<FilterButton isSelected={filter.residential} setFilterActive={() => handleFilter("residential")}>
						{<ResidentialIcon className="w-7 h-7" />} Residential
					</FilterButton>
					<FilterButton isSelected={filter.industrial} setFilterActive={() => handleFilter("industrial")}>
						{<IndustrialIcon className="w-7 h-7" />} Industrial
					</FilterButton>
					<FilterButton isSelected={filter.commercial} setFilterActive={()=>handleFilter("commercial")}>
						{<CommercialIcon className="w-7 h-7" />} Commercial
					</FilterButton>
				</div>

				<motion.div
					className="
						grid
						grid-cols-2 md:grid-cols-3 xl:grid-cols-4
						gap-x-2 2xl:gap-x-4 gap-y-6
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