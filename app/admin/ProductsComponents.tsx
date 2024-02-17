// ui
import { CommercialIcon, IndustrialIcon, ResidentialIcon } from "components/categoryIcons"
import { AnimatePresence, Variants, motion } from "framer-motion"
import { Oval } from "react-loader-spinner"
import ProductComponentsCSS from "./ProductsComponents.module.css"
// firebase
import { ProductInterface } from "types/product"
import { Transition } from "@headlessui/react"
import ProductModal from "./ProductModal"
import { useEffect, useState } from "react"
import { getAllProducts, sortProductsByName } from "util/product"
import { toast } from "react-toastify"
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "util/firebase/firestore"
import { storage } from "util/firebase/storage"
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage"

type ProductElement = {
	product: ProductInterface,
	deleteProduct: (id: string) => Promise<void>,
	openEditModal: (p: ProductInterface) => void,
	itemVariants: Variants
}
const ProductElement = ({ product, deleteProduct, openEditModal, itemVariants }: ProductElement) => {
	const [deleteActive, setDeleteActive] = useState(false)
	const [confirmDelete, setConfirmDelete] = useState(false)
	const setConfirmOn = () => {
		setConfirmDelete(true)
		setTimeout(() => setConfirmDelete(false), 3000)
	}
	const deleteThisProduct = async () => {
		setConfirmDelete(false)
		setDeleteActive(true)
		const deleteToastID = toast.warn("Deleting Product: DO NOT LEAVE THIS PAGE", {
			autoClose: false,
			closeOnClick: false,
			draggable: false,
			hideProgressBar: true,
			pauseOnHover: false
		})
		await deleteProduct(product.firestoreID)
		toast.dismiss(deleteToastID)
		setDeleteActive(false)
	}
	return (
		<motion.div
			className="flex flex-row flex-wrap lg:flex-nowrap py-4 px-3 items-center gap-x-2 rounded bg-slate-200 shadow-sm"
			variants={itemVariants} transition={{ ease: "easeInOut" }} layout
		>
			<img src={product.productImageURL} alt="" className="h-16 relative" />
			<div className="flex-1">
				<div>
					<p className="inline mr-1">{product.productName}</p>
					<div className="inline-flex flex-row gap-x-1">
						{product.commercial && <CommercialIcon className="w-4 h-4 fill-zinc-700" />}
						{product.industrial && <IndustrialIcon className="w-4 h-4 fill-zinc-700" />}
						{product.residential && <ResidentialIcon className="w-4 h-4 fill-zinc-700" />}
					</div>
				</div>
				<p>Variants: {product.variants.map(v => v.label || "_").join(", ")}</p>
			</div>
			<svg onClick={() => openEditModal(product)} className="h-6 w-6 hover:cursor-pointer shrink-0 fill-transparent stroke-black" aria-hidden="true" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /> </svg>
			<div className="shrink-0">
				{
					deleteActive
						? <Oval height={24} width={24} strokeWidth={10} color="#28a9fa" secondaryColor="#28a9fa" />
						: confirmDelete
							?
							<div className="relative">
								<svg onClick={deleteThisProduct} className="h-6 w-6 hover:cursor-pointer fill-black stroke-transparent" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" > <path clipRule="evenodd" fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" /> </svg>
								<div className={`absolute inset-0 rounded-full pointer-events-none ${ProductComponentsCSS.confirmDeleteRound}`}></div>
							</div>
							: <svg onClick={setConfirmOn} className="w-6 h-6 hover:cursor-pointer fill-transparent stroke-black" aria-hidden="true" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg>
				}
			</div>
		</motion.div>
	)
}

const useProducts = () => {
	const [products, setProducts] = useState<ProductInterface[]>([])
	const [productsLoaded, setProductsLoaded] = useState(false)
	useEffect(() => {
		getAllProducts()
			.then(allProducts => {
				setProducts(sortProductsByName(allProducts))
				setProductsLoaded(true)
			})
	}, [])
	const insertProduct = (newP: ProductInterface) => {
		setProducts(p => {
			const removedP = p.filter(p => p.firestoreID !== newP.firestoreID)
			const sortedProducts = sortProductsByName([...removedP, newP])
			return sortedProducts
		})
	}
	const deleteProduct = async (id: string) => {
		try {
			const sourceDoc = doc(db, "proudcts", id)
			const oldProduct = (await getDoc(sourceDoc)).data()
			const p1 = setDoc(doc(db, "products_deleted", id), oldProduct)


			const sourceFile = ref(storage, `products/${id}`)
			const p2 = getDownloadURL(sourceFile)
				.then(url => fetch(url))
				.then(res => res.blob())
				.then(blob => uploadBytes(ref(storage, `products_deleted/${id}`), blob))
			await Promise.all([p1, p2])

			const p3 = deleteDoc(sourceDoc), p4 = deleteObject(sourceFile)
			await Promise.all([p3, p4])
			toast.success("Product deleted")
			setProducts(p => p.filter(p => p.firestoreID !== id))
		}
		catch (err) {
			toast.error("Error deleting product, check console for error")
			console.error(err)
		}
	}
	return { products, productsLoaded, insertProduct, deleteProduct }
}
const useModal = () => {
	// edit product modal
	const [modalProduct, setModalProduct] = useState<Partial<ProductInterface> | null>(null)
	const [modalMode, setModalMode] = useState<string | null>(null)
	const openEditModal = (defaultProduct: ProductInterface) => { setModalMode("edit"); setModalProduct(defaultProduct) }
	const openNewModal = () => { setModalMode("new"); setModalProduct({}) }
	const closeModal = () => { setModalMode(null); setModalProduct(null) }
	return { modalProduct, modalMode, openEditModal, openNewModal, closeModal }
}

export const ProductsComponent = () => {
	const { modalProduct, modalMode, openEditModal, openNewModal, closeModal } = useModal()
	const { products, productsLoaded, insertProduct, deleteProduct } = useProducts()

	const opacityVariants = { hide: { opacity: 0 }, show: { opacity: 1 } }
	const parentVariants = {
		hide: { opacity: 0, transition: { staggerChildren: 0.1 } },
		show: { opacity: 1, transition: { staggerChildren: 0.1 } }
	}
	const itemVariants = {
		hide: { opacity: 0, y: "20%" },
		show: { opacity: 1, y: 0 },
		leave: { opacity: 0 }
	}
	return (
		<>
			{/* Modal */}
			<Transition show={modalProduct !== null}>
				<ProductModal
					closeModal={closeModal} defaultModalProduct={modalProduct!} //eslint-disable-line @typescript-eslint/no-non-null-assertion
					defaultMode={modalMode} insertProduct={insertProduct}
				/>
			</Transition >
			<div className="relative">
				<AnimatePresence mode="wait">
					{
						productsLoaded ?
							<motion.div
								className="grid md:grid-cols-2 2xl:grid-cols-3 gap-x-1 gap-y-1"
								key="products" initial="hide" animate="show" exit="leave" variants={parentVariants}
							>
								{products.map(product =>
									<ProductElement
										key={product.firestoreID} itemVariants={itemVariants}
										product={product} deleteProduct={deleteProduct}
										openEditModal={openEditModal}
									/>
								)}
								{/* ADD PRODUCT BUTTON */}
								<motion.button
									onClick={openNewModal}
									className="w-full rounded-lg border-[3px] transition-colors flex items-center justify-center p-2 hover:border-slate-400 hover:bg-slate-200 group"
									layout initial="hide" animate="show" exit="hide" variants={itemVariants} key="button"
								>
									<svg className="w-10 h-10 stroke-slate-400 group-hover:stroke-slate-600 fill-transparent" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.35} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</motion.button>
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
		</>
	)
}