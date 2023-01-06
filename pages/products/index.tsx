// types
import productType from "../../types/product";
// icons
import { residential, industrial, commercial } from "../../components/categoryIcons";
import seedRandom from "seedrandom";

import Link from "next/link";
import Head from "next/head";
import { MouseEventHandler, useEffect, useState } from "react";

import { motion } from "framer-motion";

import { getAllProducts } from "../../util/fillProduct";
import Price from "../../components/price";
import { Parallax } from "react-scroll-parallax";

const ProductItem = ({ product }: {product: productType})=>{
	const backgroundColours = ["bg-blue-200", "bg-neutral-300", "bg-zinc-800", "bg-lime-900"]
	const backgroundColour = backgroundColours[Math.round(seedRandom(product.firestoreID)() * 3)]
	return(
		<motion.div layout>
			<Link href={`products/${product.firestoreID}`}>
				<div className={`grid place-items-center py-10 lg:py-20 mb-2 lg:mb-6 ${backgroundColour}`}>
					<img src={product.productImageURL} alt="" className="h-32"/>
				</div>
			</Link>
			<div className="flex flex-row justify-between">
				<div>
					<h1 className="font-bold text-xl mb-2 leading-none">
						{product.productName}
					</h1>

					{/* price */}
					<Price price={product.price}/>
				</div>
				<div className="flex flex-row gap-x-3 items-center">
					{product.residential && residential}
					{product.industrial && industrial}
					{product.commercial && commercial}
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

	const handleFilter: MouseEventHandler<HTMLInputElement> = (e)=>{
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
			<div className="relative h-[33rem] select-none pointer-events-none -z-10">
				<div className="h-[113%] overflow-hidden relative">
					<img
						className="w-full object-cover max-h-[200%] h-[130%]"
						style={{clipPath:"inset(0)"}}
						src="/product_2.webp"
						alt=""
					/>
				</div>

				{/* TEXT, outside width limiter, inside */}
				<div className="container mx-auto">
					<h1
						className="absolute bottom-[0.5rem]
						text-8xl font-bold drop-shadow-md select-text pointer-events-auto"
					>
						Products
					</h1>
				</div>
			</div>

			{/* product grid */}
			<div className="
				grid
				grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4
				container mx-auto mb-6 lg:pt-4 2xl:pt-8
				lg:gap-x-2 2xl:gap-x-4">
				<div className="relative">
					<div className="bg-white p-4 sticky top-20 shadow-lg">
						<h1 className="text-2xl mb-2 font-semibold">Filters</h1>
						<hr className="mb-2"/>
						<div className="text-md flex gap-y-2 flex-col">
							<div className="flex flex-row justify-between">
								<label htmlFor="residential">Residential</label>
								<input type="checkbox" name="residential" id="residential" className="w-6 h-6" onClick={handleFilter}/>
							</div>
							<div className="flex flex-row justify-between">
								<label htmlFor="industrial">Industrial</label>
								<input type="checkbox" name="industrial" id="industrial" className="w-6 h-6" onClick={handleFilter}/>
							</div>
							<div className="flex flex-row justify-between">
								<label htmlFor="commercial">Commercial</label>
								<input type="checkbox" name="commercial" id="commercial" className="w-6 h-6" onClick={handleFilter}/>
							</div>
						</div>
					</div>
				</div>
				<motion.div
					className="
						lg:col-span-2 2xl:col-span-3
						grid
						lg:grid-cols-2 2xl:grid-cols-3
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