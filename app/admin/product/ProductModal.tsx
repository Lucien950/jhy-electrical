"use client"
import { useState } from "react";
// ui
import { Dialog, Transition } from "@headlessui/react";
import ProductModalForm from "./ProductModalForm";
import { toast } from "react-toastify";
// types
import { FirebaseProduct, Product, ProductVariantListing, validateFirebaseProduct, validateProduct } from "types/product";
import { DeepPartial } from "types/util";
// util
import { ModalModes } from "./ProductsComponent";
import { getDownloadURL, ref } from "firebase/storage";
import { generateNewSKU } from "util/product";
import { storage } from "util/firebase/storage";

// THIS COMPONENT HOLDS THE STATE
export default function ProductModal({ closeModal, defaultModalProduct, defaultMode, createProductFirebase, updateProductFirebase }: {
	// modal controls
	closeModal: () => void, defaultModalProduct: Product, defaultMode: ModalModes,
	// product mutations
	createProductFirebase: (mp: FirebaseProduct, photos: Map<string, File>) => Promise<void>,
	updateProductFirebase: (mp: Product, photos: Map<string, File>) => Promise<void>
}) {
	// state
	const [modalProduct, setModalProduct] = useState<DeepPartial<FirebaseProduct>>(defaultModalProduct)
	function handleProductEdit<K extends keyof Product, V extends Product[K]>(id: K, val: V) { setModalProduct((mp: DeepPartial<FirebaseProduct>) => ({ ...mp, [id]: val })) }
	const [imageMap,] = useState<Map<string, File>>(new Map())
	// upload state
	const [modalSubmitting, setModalSubmitting] = useState(false)
	return (
		<Dialog onClose={closeModal} className="relative z-50" >
			{/* backdrop */}
			<Transition.Child
				enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
				leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
				<div className="fixed inset-0 bg-black/30" />
			</Transition.Child>

			{/* modal container */}
			<div className="fixed inset-0 grid place-items-center">
				<Transition.Child
					enter="ease-out duration-300" enterFrom="opacity-0 translate-y-6" enterTo="opacity-100 translate-y-0"
					leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-6"
				>
					<ProductModalForm defaultMode={defaultMode} closeModal={closeModal} // modal operation 
						defaultModalProduct={modalProduct} handleProductEdit={handleProductEdit}
						createVariant={() => setModalProduct(mp => ({
							...mp,
							variants: [
								...(mp.variants || []),
								{ sku: generateNewSKU() } // this is the new created object
							]
						}))}
						updateVariant={function <K extends keyof ProductVariantListing, V extends ProductVariantListing[K]>(sku: string, id: K, val: V) {
							setModalProduct(mp => ({
								...mp,
								variants: (mp.variants || []).map(variant => variant.sku == sku ? { ...variant, [id]: val } : variant)
							}));
						}}
						deleteVariant={(sku: string) => setModalProduct(mp => ({ ...mp, variants: mp.variants?.filter(variant => variant.sku != sku) || [] }))}
						addVariantImageFile={(sku, s, f) => {
							setModalProduct(mp => ({
								...mp,
								variants: (mp.variants || []).map(variant => variant.sku == sku ? ({ ...variant, images: [...(variant.images || []), s] }) : variant)
							}))
							imageMap.set(s, f)
						}}
						removeVariantImageFile={(sku, s) => {
							setModalProduct(mp => ({
								...mp,
								variants: (mp.variants || []).map(variant => variant.sku == sku ? ({ ...variant, images: variant.images?.filter(i => i != s) || [] }) : variant)
							}))
							imageMap.delete(s)
						}}
						getVariantImageURL={async (sku, s) => {
							const variant = modalProduct.variants?.find(variant => variant.sku == sku);
							if (!variant) return null;
							if (imageMap.has(s)) return URL.createObjectURL(imageMap.get(s)!);
							if (!validateProduct(modalProduct)) return null;
							try {
								return await getDownloadURL(ref(storage, `products/${modalProduct.firestoreID}/${s}`))
							} catch (e) {
								return null;
							}
						}}
						formSubmitAction={async () => {
							setModalSubmitting(true)
							if (defaultMode === ModalModes.Edit) {
								if (!validateProduct(modalProduct)) {
									toast.error("Product Validation Error", { theme: "colored" })
									setModalSubmitting(false)
									return
								}
								await updateProductFirebase(modalProduct, imageMap)
							} else if (defaultMode === ModalModes.New) {
								if (!validateFirebaseProduct(modalProduct)) {
									toast.error("Product Validation Error", { theme: "colored" })
									setModalSubmitting(false)
									return
								}
								await createProductFirebase(modalProduct, imageMap)
							}
							setModalSubmitting(false)
							closeModal()
						}} modalSubmitting={modalSubmitting}
					/>
				</Transition.Child>
			</div>
		</Dialog>
	);
}