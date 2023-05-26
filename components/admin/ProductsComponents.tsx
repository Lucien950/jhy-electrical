// ui
import { CommercialIcon, IndustrialIcon, ResidentialIcon } from "components/categoryIcons"
import { AnimatePresence, Variants, motion } from "framer-motion"
import { Oval } from "react-loader-spinner"
// firebase
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "util/firebase/firestore"
import { ProductInterface } from "types/product"
import { deleteObject, ref } from "firebase/storage"
import { storage } from "util/firebase/storage"

type ProductElement = {
	product: ProductInterface,
	deleteDisplayProduct: (id: string) => void,
	openEditModal: (p: ProductInterface) => void,
	itemVariants: Variants
}
const ProductElement = ({ product, deleteDisplayProduct, openEditModal, itemVariants }: ProductElement) => {
	const deleteThisProduct = async (id: string) => {
		await Promise.all([deleteDoc(doc(db, "products", id)), deleteObject(ref(storage, `products/${id}`))])
		deleteDisplayProduct(id)
	}
	return (
		<motion.div
			className="flex flex-row flex-wrap lg:flex-nowrap py-4 px-3 items-center gap-x-2 rounded bg-slate-200 shadow-sm"
			variants={itemVariants} transition={{ ease: "easeInOut" }} layout
		>
			<div className="relative min-w-[4.3rem] flex justify-center">
				<img src={product.productImageURL} alt=""
					className={`h-16 relative ${product.quantity <= 0 ? "saturate-0 blur-[1px] contrast-125" : ""}`} />
				{
					product.quantity <= 0 &&
					<p className="absolute left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%] whitespace-nowrap font-semibold bg-white rounded-sm px-1">
						No Stock</p>
				}
			</div>
			<div className="flex-1">
				<div>
					<p className="inline mr-1">{product.productName}</p>
					<div className="inline-flex flex-row gap-x-1">
						{product.commercial && <CommercialIcon className="w-4 h-4 fill-zinc-700" />}
						{product.industrial && <IndustrialIcon className="w-4 h-4 fill-zinc-700" />}
						{product.residential && <ResidentialIcon className="w-4 h-4 fill-zinc-700" />}
					</div>
				</div>
				<p>{product.quantity}@${product.price}/ea</p>
			</div>
			<div>
				{
					product.width && product.height && product.length
						? <p>{product.width}cm/{product.height}cm/{product.length}cm</p>
						: <p>No cm</p>
				}
				{
					product.weight
						? <p>{product.weight} kg</p>
						: <p>No kg</p>
				}
			</div>
			<svg onClick={() => openEditModal(product)} className="h-6 w-6 hover:cursor-pointer shrink-0 fill-transparent stroke-black" aria-hidden="true" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /> </svg>
			<svg onClick={() => deleteThisProduct(product.firestoreID)} className="w-6 h-6 hover:cursor-pointer shrink-0 fill-transparent stroke-black" aria-hidden="true" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg>
		</motion.div>
	)
}

type ProductComponentProps = {
	newProductModal: () => void,
	openEditModal: (defaultProduct: ProductInterface) => void,
	products: ProductInterface[],
	deleteDisplayProduct: (id: string) => void,
	loaded: boolean }
export const ProductsComponent = ({ newProductModal, openEditModal, products, deleteDisplayProduct, loaded }: ProductComponentProps) => {
	const opacityVariants = {hide: {opacity: 0}, show: {opacity: 1}}
	const parentVariants = {
		hide: { opacity: 0, transition: { staggerChildren: 0.1 } },
		show: { opacity: 1, transition: { staggerChildren: 0.1 } }
	}
	const itemVariants = {
		hide: { opacity: 0, y: "20%" },
		show: { opacity: 1, y: 0 }
	}
	return (
		<div className="relative">
			<AnimatePresence mode="wait">
				{
					loaded ? 
					<motion.div
						className="grid md:grid-cols-2 2xl:grid-cols-3 gap-x-1 gap-y-1"
						key="products" initial="hide" animate="show" exit="hide" variants={parentVariants}
					>
						<AnimatePresence>
							{products.map(product =>
								<ProductElement key={product.firestoreID} itemVariants={itemVariants} product={product} deleteDisplayProduct={deleteDisplayProduct} openEditModal={openEditModal} />
							)}
							{/* ADD PRODUCT BUTTON */}
							<motion.button
								onClick={newProductModal}
								className="w-full rounded-lg border-[3px] transition-colors flex items-center justify-center p-2 hover:border-slate-400 hover:bg-slate-200 group"
								layout initial="hide" animate="show" exit="hide" variants={itemVariants} key="button"
							>
								<svg className="w-10 h-10 stroke-slate-400 group-hover:stroke-slate-600 fill-transparent" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.35} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</motion.button>
						</AnimatePresence>
					</motion.div>
					:
					<motion.div
						className="left-[50%] translate-x-[-50%] py-4 absolute"
						initial={false} animate="show" exit="hide" variants={opacityVariants}
						transition={{ duration: 0.3 }} key="loading"
					>
						<Oval width={120} height={120} />
					</motion.div>
				}
			</AnimatePresence>
		</div>
	)
}