"use client"
import { useEffect, useState } from "react"
// ui
import { AnimatePresence, motion } from "framer-motion"
import { Oval } from "react-loader-spinner"
import { toast } from "react-toastify"
import { Transition } from "@headlessui/react"
import ProductModal from "./ProductModal"
import ProductElement from "./ProductElement"
// types
import { FirebaseProduct, Product } from "types/product"
// firebase
import { collection, onSnapshot, addDoc, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore"
import { db } from "util/firebase/firestore"
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { storage } from "util/firebase/storage";
// util
import { MD5 } from "object-hash"
import { fillProductDoc, sortProductsByName } from "util/product"

export enum ModalModes { Edit = "edit", New = "new" }
function useModal() {
	// edit product modal
	const [defaultModalProduct, setDefaultModalProduct] = useState<Product | null>(null)
	const [modalMode, setModalMode] = useState<ModalModes | null>(null)
	const openEditModal = (defaultProduct: Product) => { setModalMode(ModalModes.Edit); setDefaultModalProduct(defaultProduct) }
	const openNewModal = () => {
		setModalMode(ModalModes.New); setDefaultModalProduct({
			residential: false,
			commercial: false,
			industrial: false,
		} as Product)
	} // empty product!!! (this is because I do not want to manage two modal's worth of state even though they need to be different, lazy moment)
	const closeModal = () => { setModalMode(null); setDefaultModalProduct(null) }
	return { defaultModalProduct, modalMode, openEditModal, openNewModal, closeModal }
}

function useLiveProduct() {
	const [products, setProducts] = useState<Product[] | null>(null)
	useEffect(() => {
		const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
			snapshot.docChanges().forEach(change => {
				switch (change.type) {
					case "added":
						setProducts(p => sortProductsByName([...(p || []), fillProductDoc(change.doc)]))
						break
					case "modified":
						setProducts(p => sortProductsByName([...(p || [])].map(product => product.firestoreID === change.doc.id ? fillProductDoc(change.doc) : product)))
						break
					case "removed":
						setProducts(p => (p || []).filter(product => product.firestoreID !== change.doc.id))
						break
				}
			})
		})
		return () => { setProducts(null); unsub() }
	}, [])

	return products
}

export default function ProductsComponent() {
	const products = useLiveProduct();
	const {
		defaultModalProduct,
		modalMode,
		openEditModal, openNewModal, closeModal
	} = useModal()
	const floatUpAnimation = { hide: { opacity: 0, y: "20%" }, show: { opacity: 1, y: 0 }, leave: { opacity: 0 } }
	return (
		<>
			{/* Modal */}
			<Transition show={defaultModalProduct !== null}>
				<ProductModal
					closeModal={closeModal} defaultModalProduct={defaultModalProduct!} defaultMode={modalMode!} //eslint-disable-line @typescript-eslint/no-non-null-assertion
					createProductFirebase={async (createProduct: FirebaseProduct, newPhotos: Map<string, File>) => {
						// this function takes a product and uploads it to firebase
						// images are based on name, and all images listed are uploaded.
						// THE MAP ONLY serves as a file container

						if (!createProduct.variants.every(v => v.images.every(i => newPhotos.has(i)))) { // check if all images are uploaded
							toast.error("Please discard all changes and reload the page (something went wrong internally, no data was lost)", { theme: "colored" })
							return
						}
						const addDocPromise = await addDoc(collection(db, "products"), createProduct)
						await Promise.all(createProduct.variants.map(async (v) => {
							await Promise.all(v.images.map(async (i) => {
								await uploadBytes(ref(storage, `products/${addDocPromise.id}/${v.sku}/${i}`), newPhotos.get(i)!)
							}))
						}))
						toast.success("Product added")
					}}
					updateProductFirebase={async (updateProduct: Product, newPhotos: Map<string, File>) => {
						// this function takes a product and a map of images
						// it will remove images that are in the original list but not in the new list
						// it will add images that are in the new list but not in the original list
						// THE MAP ONLY serves as a file container

						const { firestoreID, ...firebaseProduct } = updateProduct
						const p1 = setDoc(doc(db, "products", firestoreID), firebaseProduct) //updateDoc?

						const imagesInOldProduct = new Set(defaultModalProduct!.variants.flatMap(v => v.images))
						const imagesToUpload = updateProduct.variants.flatMap(v => v.images.filter(i => !imagesInOldProduct.has(i)))
						const p2 = Promise.all(imagesToUpload.map(i => uploadBytes(ref(storage, `products/${firestoreID}/${i}`), newPhotos.get(i)!)))
						const imagesInNewProduct = new Set(updateProduct.variants.flatMap(v => v.images))
						const imagesToDelete = Array.from(imagesInOldProduct).filter(i => !imagesInNewProduct.has(i))
						const p3 = Promise.all(imagesToDelete.map(i => { deleteObject(ref(storage, `products/${firestoreID}/${i}`)) })) // TODO make this archive

						await Promise.all([p1, p2, p3])
					}}
				/>
			</Transition>
			<div className="relative">
				<AnimatePresence mode="wait">
					{products !== null
						?
						<motion.div
							className="grid md:grid-cols-2 2xl:grid-cols-3 gap-x-1 gap-y-1"
							key="products" initial="hide" animate="show" exit="leave" variants={{
								hide: { opacity: 0, transition: { staggerChildren: 0.1 } },
								show: { opacity: 1, transition: { staggerChildren: 0.1 } }
							}}
						>
							{products.map(product =>
								<ProductElement key={MD5(product)} itemVariants={floatUpAnimation} product={product} openEditModal={openEditModal}
									deleteProduct={async (id: string) => {
										// TODO migrate delete function to properly delete old images
										try {
											// upload to deleted collection
											const sourceDoc = doc(db, "products", id)
											const oldProduct = (await getDoc(sourceDoc)).data()


											const imageFiles = await listAll(ref(storage, `products/${id}`))
											const p1 = setDoc(doc(db, "products_deleted", id), oldProduct)

											const p2 = Promise.all(imageFiles.items.map(async i => {
												const url = await getDownloadURL(i)
												const res = await fetch(url)
												const blob = await res.blob()
												await uploadBytes(ref(storage, `products_deleted/${id}/${i.name}`), blob)
											}))
											await Promise.all([p1, p2])
											// delete old objects
											const p3 = deleteDoc(sourceDoc)
											const p4 = Promise.all(imageFiles.items.map(i => deleteObject(i)))
											await Promise.all([p3, p4])
											toast.success("Product deleted")
										}
										catch (err) {
											toast.error("Error deleting product, check console for error")
											console.error(err)
										}
									}}
								/>
							)}
							{/* ADD PRODUCT BUTTON */}
							<motion.button key="button" onClick={openNewModal} layout initial="hide" animate="show" exit="hide"
								variants={floatUpAnimation}
								className="w-full rounded-lg border-[3px] transition-colors flex items-center justify-center p-2 hover:border-slate-400 hover:bg-slate-200 group"
							>
								{/* plus button */}
								<svg className="w-10 h-10 stroke-slate-400 group-hover:stroke-slate-600 fill-transparent" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.35} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</motion.button>
						</motion.div>
						:
						<motion.div
							className="left-[50%] translate-x-[-50%] py-4 absolute"
							initial={false} animate="show" exit="hide" variants={{ hide: { opacity: 0 }, show: { opacity: 1 } }}
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