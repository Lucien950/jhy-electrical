// types
import { GetServerSideProps } from "next";
import productType from "../../types/product"
// icons
import { residential, industrial, commercial } from "../../components/categoryIcons";
import seedRandom from "seedrandom";
import Link from "next/link";
import { getAllProducts } from "../../util/fillProduct";
import Price from "../../components/price";
import Head from "next/head";

const ProductItem = ({ product }: {product: productType})=>{
	const backgroundColours = ["bg-blue-200", "bg-neutral-300", "bg-zinc-800", "bg-lime-900"]
	const backgroundColour = backgroundColours[Math.round(seedRandom(product.firestoreID)() * 3)]
	return(
		<div>
			<Link href={`products/${product.firestoreID}`}>
				<div className={`grid place-items-center py-10 lg:py-20 mb-2 lg:mb-6 ${backgroundColour}`}>
					<img src={product.productImageURL} alt="" className="h-32"/>
				</div>
			</Link>

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
	)
}

interface productServerProps{
	products: productType[]
}
const products = ({ products }: productServerProps) => {
	return (
		<>
			<Head>
				<title>Products | JHY Electrical</title>
			</Head>
			{/* banner */}
			<div className="relative overflow-hidden h-96 select-none pointer-events-none">
				<img
					className="h-[120%] max-w-none w-[120%] object-cover blur-sm relative left-[-4px] top-[-4px]"
					style={{clipPath:"inset(0)"}}
					src="https://images.unsplash.com/photo-1529854140025-25995121f16f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3540&q=80"
					alt=""
				/>
				<h1 className="text-6xl font-bold absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-white drop-shadow-md select-text pointer-events-auto">
					PRODUCTS
				</h1>
			</div>

			{/* product grid */}
			<div className="
				grid
				grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4
				lg:px-6 lg:pt-4 lg:gap-x-4
				2xl:px-24 2xl:pt-8 2xl:gap-x-6
				gap-y-6 mb-6
			">
				{products.map((product, i)=>
					<ProductItem product={product} key={i}/>
				)}
			</div>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async () => {
	
	return {
		props: {
			products: JSON.parse(JSON.stringify(await getAllProducts()))
		}
	}
}

export default products;