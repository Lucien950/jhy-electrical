"use client"
// UI
import { ResidentialIcon, IndustrialIcon, CommercialIcon } from "components/categoryIcons";
import { AnimatePresence, motion } from "framer-motion";
import { Residential, Industrial, Commercial } from "components/categoryIcons";
import seedRandom from "seedrandom";
import Price from "components/price";
import Link from "next/link";
import { Oval } from "react-loader-spinner";
//state
import { useEffect, useState } from "react";
import { getAllProducts } from "util/product/productUtil";
// types
import { ProductInterface } from "types/product";

const opacityVariants = {
  hide: { opacity: 0 },
  show: { opacity: 1 }
}

const ProductItem = ({ product }: { product: ProductInterface }) => {
  // const backgroundColours = ["bg-blue-200", "bg-neutral-300", "bg-zinc-800", "bg-lime-900"]
  const backgroundColours = ["bg-slate-800"]
  const backgroundColour = backgroundColours[Math.round(seedRandom(product.firestoreID)() * (backgroundColours.length - 1))]

  const minPrice = Math.min(...product.variants.map(v => v.price)), maxPrice = Math.max(...product.variants.map(v => v.price))
  const onePrice = product.variants.length === 1 || product.variants.map(v => v.price).every((val, _, arr) => val === arr[0])
  return (
    <motion.div layout>
      <Link href={`products/${product.firestoreID}`} className="block focus:ring-8 focus:outline-none rounded-lg">
        <div className={`grid place-items-center py-10 lg:py-14 mb-2 lg:mb-6 group ${backgroundColour} rounded-lg`}>
          <img src={product.productImageURL} alt="" className="h-24 md:h-32 group-hover:scale-105 transition-transform" />
        </div>
      </Link>

      <div className="flex flex-col gap-y-2 md:flex-row justify-between">
        <div>
          <Link href={`products/${product.firestoreID}`} tabIndex={-1}>
            <h1 className="font-bold text-xl mb-2 leading-none">
              {product.productName}
            </h1>

            {/* price */}
            {
              onePrice ?
                <Price price={minPrice} />
                :
                <>
                  <Price price={minPrice} />
                  <span className="mx-1 font-bold"> - </span>
                  <Price price={maxPrice} />
                </>
            }
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

const FilterButton = ({ isSelected, setFilterActive, children }: { children: (string | JSX.Element)[], isSelected: boolean, setFilterActive: () => void }) => {
  return (
    <button className={`flex flex-row items-center gap-x-2 py-2 px-4 border-[3px] rounded-full leading-none
			transition-colors duration-75 hover:bg-blue-200 hover:border-blue-300
			outline-none focus:ring-4
			${isSelected && "bg-blue-400 border-blue-500 text-white fill-white"}`}
      onClick={setFilterActive} id="residential"
    >
      {children}
    </button>
  )
}

export default function Listings() {
  const [filter, setFilter] = useState({
    residential: false,
    industrial: false,
    commercial: false
  })
  const handleFilter = (property: "residential" | "industrial" | "commercial") => {
    setFilter({ ...filter, [property]: !filter[property] })
  }

  const [products, setProducts] = useState([] as ProductInterface[])
  const [displayProducts, setDisplayProducts] = useState([] as ProductInterface[])


  useEffect(() => { getAllProducts().then(setProducts) }, [])
  useEffect(() => {
    if (!Object.values(filter).some(p => p)) setDisplayProducts(products)
    else setDisplayProducts(products.filter(p => p.residential && filter.residential || p.commercial && filter.commercial || p.industrial && filter.industrial))
  }, [products, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* Filter Bar */}
      <div className="container mx-auto pb-16">
        <div
          className="sm:sticky top-[80px] z-10
						flex flex-row items-center gap-x-2 flex-wrap gap-y-2
						p-2 lg:p-4 sm:mb-6 mx-2 lg:mx-4 rounded-md bg-white sm:shadow-md"
        >
          {/* funnel */}
          <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
          <FilterButton isSelected={filter.residential} setFilterActive={() => handleFilter("residential")}>
            {<ResidentialIcon className="w-7 h-7" />} Residential
          </FilterButton>
          <FilterButton isSelected={filter.industrial} setFilterActive={() => handleFilter("industrial")}>
            {<IndustrialIcon className="w-7 h-7" />} Industrial
          </FilterButton>
          <FilterButton isSelected={filter.commercial} setFilterActive={() => handleFilter("commercial")}>
            {<CommercialIcon className="w-7 h-7" />} Commercial
          </FilterButton>
        </div>

        <AnimatePresence mode="wait">
          {
            products.length === 0
              ?
              <motion.div className="grid place-items-center py-10" initial="hide" animate="show" exit="hide" variants={opacityVariants} key={"productsloading"}>
                <Oval height={100} strokeWidth={8} />
              </motion.div>
              :
              <motion.div
                className="
									grid
									grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
									gap-x-2 2xl:gap-x-4 gap-y-6
									px-2 lg:px-4
								"
                layout initial="hide" animate="show" exit="hide" variants={opacityVariants} key={"productsloaded"}
              >
                {displayProducts.map((product) =>
                  <ProductItem product={product} key={product.firestoreID} />
                )}
              </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>
  )
}