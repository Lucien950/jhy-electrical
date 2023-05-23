import { Dialog, Transition } from "@headlessui/react";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { DragEventHandler, FormEvent, useRef, useState } from "react";
import { Oval } from "react-loader-spinner";
import { toast } from "react-toastify";
import { FirebaseProductInterface, ProductInterface, validateProduct, validateProductError } from "types/product";
import { firebaseConsoleBadge } from "util/firebase/console";
import { db } from "util/firebase/firestore";
import { storage } from "util/firebase/storage";
import { toSentenceCase } from "util/string";

const stopProp: DragEventHandler<HTMLDivElement> = (e) => { e.preventDefault(); e.stopPropagation() }
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"]

type InputFieldPropType = {
	label: string,
	defaultValue: string | number,
	numberValue?: boolean,
	className?: string,
	productKey: string,
	unit?: string,
	handleChange: (id: string, val: any) => void //eslint-disable-line @typescript-eslint/no-explicit-any
}
const InputField = ({ label, defaultValue, numberValue = false, className, productKey, unit, handleChange }: InputFieldPropType) => {
	if (typeof defaultValue == "number" && defaultValue == -1) defaultValue = ""
	return (
		<div>
			<label className="block font-semibold text-sm" htmlFor={productKey}>{label}</label>
			<div className="relative">
				<input className={`block border-2 border-zinc-400 rounded-md p-1 focus:outline-none focus:ring-2 w-full text-lg ${className ?? className}`}
					onChange={e => handleChange(productKey, numberValue ? parseFloat(e.target.value) : e.target.value)} type="text" id={productKey} defaultValue={defaultValue} />
				<span className="absolute right-2 top-[50%] translate-y-[-50%] text-zinc-500 pointer-events-none text-sm">{unit}</span>
			</div>
		</div>
	)
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
const Pill = ({ label, checked, handleChange }: { label: string, checked: boolean, handleChange: (id: string, val: any) => void})=>{
	return(
		<label
			className={`block select-none text-sm transition-colors hover:cursor-pointer p-1 px-4 border-2 rounded-xl outline-none focus:ring-2
			${checked ? "text-white bg-blue-600 border-blue-700" : "border-zinc-400"}`}
			tabIndex={0} htmlFor={label}
		>
			{toSentenceCase(label)}
			<input className="hidden" onChange={(e)=>handleChange(label, e.target.checked)} type="checkbox" name="" id={label} defaultChecked={checked} />
		</label>
	)
}

type ProductModalType = {
	closeModal: () => void,
	defaultModalProduct: ProductInterface,
	mode: string | null,
	insertProduct: (p: ProductInterface)=>void
}
const ProductModal = ({ closeModal, defaultModalProduct, mode, insertProduct }: ProductModalType) => {
	// data state
	const [modalProduct, setModalProduct] = useState(defaultModalProduct)
	const [productImageFile, setProductImageFile] = useState<File>()
	// ui state
	const [uploading, setUploading] = useState(false)
	const [displayImageURL, setDisplayImageURL] = useState(defaultModalProduct?.productImageURL || null)

	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleProductEdit = (id: string, val: any) => setModalProduct(mp => ({ ...mp, [id]: val }))
	const handleProductFileEdit = (files: FileList | null)=>{
		if(!files) return
		const fr = new FileReader();
		fr.onload = () => {
			const fileReadResult = fr.result
			if (typeof (fileReadResult) != "string") {
				console.error("Image display error, file type not string")
				return
			}
			setProductImageFile(files[0])
			setDisplayImageURL(fileReadResult)
		}
		fr.readAsDataURL(files[0]);
	}

	const submitProduct = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();e.stopPropagation()

		// validation
		const hasImage = modalProduct.productImageURL || productImageFile
		if (!hasImage) return toast.error("No image uploaded", { theme: "colored" })
		if (!validateProduct(modalProduct)) {
			const error = validateProductError(modalProduct)! //eslint-disable-line @typescript-eslint/no-non-null-assertion
			console.error("Product Validation Error", error)
			toast.error(error.message, { theme: "colored" })
			return
		}

		// loading
		setUploading(true)

		// FIRESTORE Update
		//eslint-disable-next-line @typescript-eslint/no-unused-vars, prefer-const
		let { productImageURL: newProductImageURL, firestoreID: newFirestoreID, ...rest } = modalProduct
		const firestoreAddProduct = rest as FirebaseProductInterface
		try{
			if (newFirestoreID) await setDoc(doc(db, "products", newFirestoreID), firestoreAddProduct)
			else {
				const addedDoc = await addDoc(collection(db, "products"), firestoreAddProduct)
				newFirestoreID = addedDoc.id
			}
		}
		catch(e){
			toast.error("Firestore write error", { theme: "colored" })
			console.error("[Firestore Error] Firestore Write Error", e)
			setUploading(false)
			return
		}

		// if uploading first, or existing photo, there will be url (from blob and firebase storage url respectively)
		// thus above check catches no file uploaded and no firebase storage
		if (productImageFile) {
			try{
				const productImageRef = ref(storage, `products/${newFirestoreID}`)
				const storedImage = await uploadBytes(productImageRef, productImageFile)
				newProductImageURL = await getDownloadURL(storedImage.ref)
			}
			catch(e){
				console.error(...firebaseConsoleBadge, "Firebase Storage Error", e)
				toast.error("Firebase Storage Error: Check console for more", { theme: "colored" })
				setUploading(false)
				return
			}
		}

		console.log(...firebaseConsoleBadge, "Firestore Update Success")
		insertProduct({
			...firestoreAddProduct,
			firestoreID: newFirestoreID,
			productImageURL: newProductImageURL
		} as ProductInterface)
		closeModal()
	}

	const [fileActive, setFileActive] = useState(false)
	const dragElement = useRef<HTMLDivElement>(null)
	const dragEnter: DragEventHandler<HTMLDivElement> = (e) => {stopProp(e); setFileActive(true) }
	const dragLeave: DragEventHandler<HTMLDivElement> = (e) => {
		if(dragElement.current?.contains(e.relatedTarget as Node)) return
		stopProp(e); setFileActive(false);console.log("leave")
	}
	const dropListener: DragEventHandler<HTMLDivElement> = (e) => {
		stopProp(e)

		const dataFiles = e.dataTransfer.files
		if (dataFiles.length > 1) return toast.error("Too many files", {theme: "colored"})

		const imageFile = dataFiles[0]
		if (!IMAGE_TYPES.includes(imageFile.type)) return toast.error("Wrong file type", {theme: "colored"})
		
		setProductImageFile(imageFile)
		setDisplayImageURL(URL.createObjectURL(imageFile))
		setFileActive(false)
	}

	return (
		<Dialog onClose={closeModal} className="relative z-50" >
			{/* backdrop */}
			<Transition.Child
				enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
				leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
			>
				<div className="fixed inset-0 bg-black/30" />
			</Transition.Child>

			{/* modal container */}
			<div className="fixed inset-0 grid place-items-center">
				<Transition.Child
					enter="ease-out duration-300" enterFrom="opacity-0 translate-y-6" enterTo="opacity-100 translate-y-0"
					leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-6"
				>
					<Dialog.Panel as="form" className="bg-white z-20 max-h-[90vh] overflow-scroll rounded-xl w-[37rem]" onSubmit={submitProduct}>
						{/* modal */}
						<div className="sticky top-0 bg-white">
							<div className="flex flex-row p-8 px-12 pb-2 justify-between">
								<Dialog.Title className="text-3xl font-bold">{mode ? toSentenceCase(mode) : "...."} Product</Dialog.Title>
								{/* x button */}
								<svg onClick={closeModal} tabIndex={0} className="w-8 h-8 hover:cursor-pointer focus:outline-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</div>
							<hr />
						</div>

						{/* grid */}
						<div className="grid grid-cols-2 gap-x-2 gap-y-4 p-8 px-12">
							{/* images */}
							<div
								onDrop={dropListener} onDragEnter={dragEnter} onDragLeave={dragLeave} onDragOver={stopProp} onDrag={stopProp}
								className={`border-2 border-zinc-400 ${fileActive ? "!border-blue-500" : ""} rounded-xl border-dashed flex flex-col justify-center items-center col-span-2 p-10 py-6`}
								ref={dragElement}
							>
								{
									displayImageURL &&
									<div className="h-16 mb-4">
										<img id="outImage" src={displayImageURL} alt="Product Image" className="h-16" />
									</div>
								}
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
									className="w-6 h-6">
									<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
								</svg>
								<input className="hidden" onChange={(e)=>handleProductFileEdit(e.target.files)} type="file" id="productImageFile" accept='image/jpeg, image/png' />
								<p>
									Drag & Drop or
									<label
										htmlFor="productImageFile"
										className="hover:cursor-pointer text-blue-600 hover:underline focus:outline-2 outline-blue-500 outline-offset-2"
										tabIndex={0}> Choose File </label>
									to upload
								</p>
							</div>

							<div className="col-span-2">
								<InputField label="Product Name" productKey="productName" defaultValue={modalProduct.productName} handleChange={handleProductEdit} />
							</div>
							{/* Pill Row */}
							<div className="flex flex-row gap-x-2 col-span-2 text-lg">
								<Pill label="residential" checked={modalProduct.residential} handleChange={handleProductEdit}/>
								<Pill label="commercial" checked={modalProduct.commercial} handleChange={handleProductEdit} />
								<Pill label="industrial" checked={modalProduct.industrial} handleChange={handleProductEdit} />
							</div>
							<InputField label="Quantity" 						productKey="quantity" defaultValue={modalProduct.quantity}	numberValue handleChange={handleProductEdit} />
							<InputField label="Price"  unit="$CAD" 	productKey="price" 		defaultValue={modalProduct.price} 		numberValue handleChange={handleProductEdit} />
							<InputField label="Weight" unit="kg" 		productKey="weight" 	defaultValue={modalProduct.weight} 		numberValue handleChange={handleProductEdit} />
							<div className="flex flex-row gap-x-2 justify-around">
								<InputField label="Width"  productKey="width"  defaultValue={modalProduct.width}  unit="cm" numberValue className="!w-16" handleChange={handleProductEdit}/>
								<InputField label="Height" productKey="height" defaultValue={modalProduct.height} unit="cm" numberValue className="!w-16" handleChange={handleProductEdit}/>
								<InputField label="Length" productKey="length" defaultValue={modalProduct.length} unit="cm" numberValue className="!w-16" handleChange={handleProductEdit}/>
							</div>
							<div className="col-span-2">
								<label className="block text-sm" htmlFor="description">Description</label>
								<textarea
									className="block border-2 border-zinc-400 w-full max-h-32 rounded-md py-1 px-2 outline-none focus:ring-2 text-lg"
									onChange={(e)=>handleProductEdit("description", e.target.value)} name="description" id="description" defaultValue={modalProduct.description}
								/>
							</div>

							<div className="col-span-2 grid grid-cols-2 gap-x-4">
								<button className="py-2 rounded-lg outline-none focus:ring-2 border-2 border-zinc-400"
									type="button" onClick={closeModal} disabled={uploading}>Cancel</button>
								{/* submit button */}
								<button className="py-2 rounded-lg outline-none focus:ring-2 bg-blue-600 text-white relative"
									type="submit" disabled={uploading}>
									{
										uploading
											? <Oval height={22} strokeWidth={7} color="white" secondaryColor="white"
												wrapperClass="absolute left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%]" />
											: `${mode ? toSentenceCase(mode) : "..."} Item`
									}
								</button>
							</div>
						</div>
					</Dialog.Panel>
				</Transition.Child>
			</div>
		</Dialog>
	);
}

export default ProductModal;