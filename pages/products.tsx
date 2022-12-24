import { GetServerSideProps } from "next";
import productType from "../types/product"
import db from "../firebase/firestore"
import { collection, getDocs } from "firebase/firestore"; 
import { getDownloadURL, ref } from "firebase/storage";
import storage from "../firebase/storage";

const commercial = (
	<svg className="h-8 w-8" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512.001 512.001">
		<g>
			<g>
				<path d="M489.692,198.569h-2.481c-14.662,0-27.94-6.024-37.501-15.723c-9.562,9.697-22.839,15.723-37.501,15.723h-2.48
				c-14.662,0-27.94-6.024-37.501-15.723c-9.562,9.697-22.839,15.723-37.501,15.723h-2.481c-14.662,0-27.94-6.024-37.501-15.723
				c-9.562,9.697-22.839,15.723-37.501,15.723h-2.48c-14.662,0-27.94-6.024-37.501-15.723c-9.562,9.697-22.839,15.723-37.501,15.723
				h-2.48c-14.662,0-27.94-6.024-37.501-15.723c-9.562,9.697-22.839,15.723-37.501,15.723h-2.481
				c-14.662,0-27.94-6.024-37.501-15.723c-9.562,9.697-22.839,15.723-37.501,15.723h-2.48c-7.971,0-15.528-1.789-22.307-4.97v283.458
				h73.158V236.618h129.512v240.439H512V193.599C505.221,196.781,497.662,198.569,489.692,198.569z M336.815,386.659h-80.389v-59.827
				h80.389V386.659z M336.815,296.446h-80.389v-59.828h80.389V296.446z M447.59,386.659H367.2v-59.827h80.39V386.659z
				M447.59,296.446H367.2v-59.828h80.39V296.446z"/>
			</g>
		</g>
		<g>
			<g>
				<rect x="464.903" y="34.944" width="47.098" height="76.825" />
			</g>
		</g>
		<g>
			<g>
				<rect x="387.419" y="34.944" width="47.098" height="76.825" />
			</g>
		</g>
		<g>
			<g>
				<rect x="309.935" y="34.944" width="47.098" height="76.825" />
			</g>
		</g>
		<g>
			<g>
				<rect x="232.452" y="34.944" width="47.098" height="76.825" />
			</g>
		</g>
		<g>
			<g>
				<rect x="154.968" y="34.944" width="47.098" height="76.825" />
			</g>
		</g>
		<g>
			<g>
				<rect x="77.484" y="34.944" width="47.098" height="76.825" />
			</g>
		</g>
		<g>
			<g>
				<polygon points="0,34.944 0,111.769 47.097,111.769 47.098,111.769 47.098,34.944 		" />
			</g>
		</g>
		<g>
			<g>
				<path d="M464.901,142.154v3.721h0.001c0,12.301,10.008,22.308,22.308,22.308h2.481c12.301,0,22.308-10.007,22.308-22.308v-3.721
				H464.901z"/>
			</g>
		</g>
		<g>
			<g>
				<path d="M387.417,142.154v3.721h0.001c0,12.301,10.008,22.308,22.308,22.308h2.481c12.301,0,22.308-10.007,22.308-22.308v-3.721
				H387.417z"/>
			</g>
		</g>
		<g>
			<g>
				<path d="M309.933,142.154v3.721h0.001c0,12.301,10.008,22.308,22.308,22.308h2.481c12.301,0,22.308-10.007,22.308-22.308v-3.721
				H309.933z"/>
			</g>
		</g>
		<g>
			<g>
				<path d="M232.449,142.154v3.721h0.001c0,12.301,10.008,22.308,22.308,22.308h2.481c12.301,0,22.308-10.007,22.308-22.308v-3.721
				H232.449z"/>
			</g>
		</g>
		<g>
			<g>
				<path d="M154.966,142.154v3.721h0.001c0,12.301,10.008,22.308,22.308,22.308h2.481c12.301,0,22.308-10.007,22.308-22.308v-3.721
				H154.966z"/>
			</g>
		</g>
		<g>
			<g>
				<path d="M77.484,142.154L77.484,142.154l-0.001,3.721c0,12.301,10.008,22.308,22.308,22.308h2.481
				c12.301,0,22.308-10.007,22.308-22.308v-3.721H77.484z"/>
			</g>
		</g>
		<g>
			<g>
				<path d="M0,142.154v3.721c0,12.301,10.007,22.308,22.307,22.308h2.481c12.301,0,22.308-10.007,22.308-22.308v-3.721H0z" />
			</g>
		</g>
	</svg>
)
const industrial = (
	<svg className="h-8 w-8" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
		viewBox="0 0 330.02 330.02">
		<g id="XMLID_312_">
			<path id="XMLID_333_" d="M319.987,74.386C319.652,66.351,313.041,60.01,305,60.01h-26.51c-6.968-34.192-37.27-60-73.49-60
		c-0.107,0-0.212,0.014-0.318,0.016L15.002,0.01H15c-8.283,0-15,6.715-15,14.998c0,8.285,6.715,15.001,14.998,15.002l190.001,0.016
		H205c0.072,0,0.141-0.01,0.213-0.01c19.462,0.09,36.037,12.599,42.207,29.994H225c-8.041,0-14.652,6.341-14.987,14.376
		l-5.377,129.046l-79.029-79.028c-4.29-4.291-10.742-5.573-16.347-3.252c-5.606,2.321-9.26,7.792-9.26,13.858v63.786l-74.394-74.393
		c-4.29-4.291-10.742-5.575-16.347-3.252C3.654,123.473,0,128.943,0,135.01v180c0,8.284,6.716,15,15,15h200h100
		c0.007,0,0.015,0,0.02,0c8.285,0,15-6.716,15-15c0-0.478-0.021-0.95-0.065-1.416L319.987,74.386z"/>
		</g>
	</svg>
)

const ProductItem = ({ product }: {product: productType})=>{
	return(
		<div className="border-2 p-4">
			<img src={product.productImageURL} alt="" />
			<p>
				{product.productName}
			</p>
			<p>
				{product.description}
			</p>
			<p>
				x{product.quantity} ${product.price}
			</p>
			<div className="flex flex-row	gap-x-2	items-center justify-around">
				{product.residential && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
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
		<div>
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
			<div className="grid grid-cols-3 px-24 pt-8 gap-x-4">
				{products.map((product, i)=>
					<ProductItem product={product} key={i}/>
				)}
			</div>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async () => {
	const productsQS = await getDocs(collection(db, "products"));
	let products: productType[] = []
	productsQS.forEach(doc=>{
		const product = doc.data() as productType
		product.firestoreID = doc.id
		products.push(product)
	})

	const productPictures = products.map(async p => {
		p.productImageURL = await getDownloadURL(ref(storage, `products/${p.productImage}`))
		return p
	})
	return await Promise.all(productPictures).then(p=>{
		return {
			props: {
				products: JSON.parse(JSON.stringify(p))
			}
		}
	})
}

export default products;