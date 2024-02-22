"use client"
import { useState } from "react";
// ui
import { Dialog, Transition } from "@headlessui/react";
// types
import { FirebaseProduct, Product, ProductVariantListing, validateFirebaseProduct, validateProduct } from "types/product";
import { ModalModes } from "./ProductsComponent";
import ProductModalForm from "./ProductModalForm";
import { generateNewSKU } from "util/product";
import { DeepPartial } from "types/util";
import { toast } from "react-toastify";

// THIS COMPONENT MANAGES THE STATE
export default function ProductModal({ closeModal, defaultModalProduct, defaultMode, createProduct, updateProduct }: {
	closeModal: () => void,
	defaultModalProduct: Product,
	defaultMode: ModalModes,

	createProduct: (mp: FirebaseProduct, photos: Map<string, File>) => Promise<void>,
	updateProduct: (mp: Product, photos: Map<string, File>) => Promise<void>
}) {
	const [modalProduct, setModalProduct] = useState<DeepPartial<FirebaseProduct>>(defaultModalProduct)
	const [imageMap, ] = useState<Map<string, File>>(new Map())

	function handleProductEdit<K extends keyof Product, V extends Product[K]>(id: K, val: V) {
		setModalProduct(mp => ({ ...mp, [id]: val }))
	}
	// upload state
	const [submitting, setSubmitting] = useState(false)
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
						modalProduct={modalProduct} handleProductEdit={handleProductEdit}
						createVariant={() => setModalProduct(mp => ({
							...mp,
							variants: [
								...(mp.variants || []),
								{ sku: generateNewSKU() } // this is the new created object
							]
						}))}
						updateVariantGen={(sku: string) => function <K extends keyof ProductVariantListing, V extends ProductVariantListing[K]>(id: K, val: V) {
							setModalProduct(mp => {
								const variant = mp.variants?.find(vv => vv.sku == sku);
								if (!variant) return mp;
								variant[id] = val;
								return mp;
							});
						}}
						deleteVariant={(sku: string) => setModalProduct(mp => ({
							...mp,
							variants: mp.variants?.filter(vv => vv.sku != sku) || []
						}))}
						addVariantImageFile={(sku, s, f) => {
							setModalProduct(mp => {
								const variant = mp.variants?.find(vv => vv.sku == sku);
								if (!variant) return mp;
								variant.images = [...(variant.images || []), s];
								return mp;
							})
							imageMap.set(s, f)
						}}
						removeVariantImageFile={(sku, s) => {
							setModalProduct(mp => {
								const variant = mp.variants?.find(vv => vv.sku == sku);
								if (!variant) return mp;
								variant.images = variant.images?.filter(i => i != s);
								return mp;
							})
							imageMap.delete(s)
						}}
						onFormSubmit={async () => {
							setSubmitting(true)
							if (defaultMode === ModalModes.Edit) {
								if(!validateProduct(modalProduct)) {
									toast.error("Product Validation Error", { theme: "colored" })
									setSubmitting(false)
									return
								}
								await updateProduct(modalProduct, imageMap)
							} else if (defaultMode === ModalModes.New) {
								if(!validateFirebaseProduct(modalProduct)) {
									toast.error("Product Validation Error", { theme: "colored" })
									setSubmitting(false)
									return
								}
								await createProduct(modalProduct, imageMap)
							}
							setSubmitting(false)
							closeModal()
						}} uploading={submitting}
					/>
				</Transition.Child>
			</div>
		</Dialog>
	);
}