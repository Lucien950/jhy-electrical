// react
import { ChangeEvent, DragEventHandler, FormEvent, Fragment, useEffect, useState } from "react";
// firebase
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import { db } from 'util/firebase/firestore';
import { storage } from "util/firebase/storage"
// utils
import { fillProductDoc } from "util/productUtil";
import { toSentenceCase } from "util/stringManipulation";
import ProductInterface from 'types/product';
// UIs
import { AnimatePresence, motion } from "framer-motion";
import { CommercialIcon, IndustrialIcon, ResidentialIcon } from "components/categoryIcons";
import { Dialog, Transition } from '@headlessui/react'
import { Oval } from "react-loader-spinner";
import { firebaseConsoleBadge } from "util/firebase/console";

type InputFieldPropType = {
	label: string,
	defaultValue: string | number,
	numberValue?: boolean,
	className?: string,
	productKey: string,
	unit?: string,
	handleChange: (e: ChangeEvent<HTMLInputElement>) => void
}
const InputField = ( { label, defaultValue, numberValue = false, className, productKey, unit, handleChange }: InputFieldPropType ) => {
	if (typeof defaultValue == "number" && defaultValue == -1) defaultValue = ""
	return (
		<div>
			<label className="block font-semibold text-sm" htmlFor={productKey}>{label}</label>
			<div className="relative">
				<input className={`block border-2 border-zinc-400 rounded-md p-1 focus:outline-none focus:ring-2 w-full text-lg ${className ?? className}`}
					onChange={handleChange} data-numbervalue={numberValue} type="text" id={productKey} defaultValue={defaultValue} />
				<span className="absolute right-2 top-[50%] translate-y-[-50%] text-zinc-500 pointer-events-none text-sm">{unit}</span>
			</div>
		</div>
	)
}

type ProductModalProp = { open: boolean, product: ProductInterface, mode: string, closeModal: () => void }
export const ProductModal = ({ open, product, mode, closeModal }: ProductModalProp) => {
	const [uploading, setUploading] = useState(false)
	const [addProduct, setAddProduct] = useState({} as ProductInterface)
	const [changedImage, setChangedImage] = useState(false)

	useEffect(()=>{
		if(Object.keys(product).length > 0) {
			setUploading(false)
			setAddProduct(product)
		}
	}, [product])

	// TODO refactor this out
	const addProductChange = (e: ChangeEvent<HTMLInputElement>) => {
		const productAttribute = e.target.id
		if (productAttribute == null) {
			console.error("Could not get add_product_attribute (ID)")
			return
		}
		// checkboxes
		if (e.target.type == "checkbox") {
			setAddProduct((oldAddProduct) => {return {...oldAddProduct, [productAttribute]: e.target.checked}})
			return
		}
		// textboxes
		if (e.target.type == "text") {
			let inputFieldValue: string | number = e.target.value
			const isNumberValue = e.target.getAttribute("data-numberValue") === "true"
			if (isNumberValue) inputFieldValue = parseFloat(inputFieldValue)
			setAddProduct(oldAddProduct => {
				(oldAddProduct as any)[productAttribute] = inputFieldValue
				return oldAddProduct
			})
			return
		}
		// files
		if (e.target.type == "file") {
			const files = e.target.files
			if (!files) {
				console.error("File not found")
				return
			}
			const fr = new FileReader();
			fr.onload = () => {
				const fileReadResult = fr.result
				if (typeof (fileReadResult) != "string") {
					console.error("Image display error, file type not string")
					return
				}
				setAddProduct(oldAddProduct => {
					return {
						...oldAddProduct,
						productImage: files[0].name,
						productImageFile: files[0],
						productImageURL: fileReadResult
					}
				})
			}
			fr.readAsDataURL(files[0]);
		}

		// if not any of the input types, error out
		console.error("Input box not checkbox or text, it is", e.target.type)
	}
	const addProductChangeTA = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setAddProduct(oldAddProduct => {
			return {
				...oldAddProduct,
				description: e.target.value,
			}
		})
	}
	const addProductSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		e.stopPropagation()

		// SUBMITTING
		if (
			!addProduct ||
			!addProduct.productImageURL || !addProduct.productName ||
			addProduct.price <= 0 || addProduct.quantity < 0 || addProduct.width < 0 || addProduct.height < 0 || addProduct.length < 0 ||
			!addProduct.description) {
			// TODO Display Error Here
			console.error("[Input Error] Product not complete")
			return
		}

		// loading
		setUploading(true)
		

		// if uploading first, or existing photo, there will be url (from blob and firebase storage url respectively)
		// thus above check catches no file uploaded and no firebase storage
		// here, we only check if there is an uploaded photo
		const productImageRef = ref(storage, `products/${addProduct.productImage}`)
		// upload image to storage
		if (addProduct.productImageFile) {
			const snapshotFile = await uploadBytes(productImageRef, addProduct.productImageFile).catch(e => {
				console.error(e)
			})
			if (!snapshotFile) {
				console.error("[Firebase Storage Error] file upload error")
				setUploading(false)
				return
			}
		}

		// FIRESTORE Update
		const { firestoreID, ...firestoreAddProduct } = addProduct
		let error = false;
		switch(mode){
			case "edit":
				await setDoc(doc(db, "products", firestoreID), firestoreAddProduct)
					.catch(e => {
						console.error("[Firestore Error] Firestore Write Error", e)
						setUploading(false)
						error = true
					});
				break
			case "new":
				await addDoc(collection(db, "products"), firestoreAddProduct).catch(e => {
					console.error("[Firestore Error] Firestore Write Error", e)
					setUploading(false)
					error = true
				});
				break
			default:
				console.error("Invalid Mode")
		}
		if (error && mode == "new") {
			await deleteObject(productImageRef).catch(e => { console.error("[Firebase File Upload Error] Storage Delete Failure", e) })
			return
		}

		console.log(...firebaseConsoleBadge, "Firestore Update Success")
		closeModal()
	}

	const [fileActive, setFileActive] = useState(false)
	const stopProp: DragEventHandler<HTMLDivElement> = (e)=>{
		e.preventDefault()
		e.stopPropagation()
	}
	const dropListener: DragEventHandler<HTMLDivElement> = (e) => {
		stopProp(e)

		const dataFiles = e.dataTransfer.files
		if (dataFiles.length > 1 || dataFiles.length <= 0){
			console.error("Too many files")
			return
		}
		const dataFile = dataFiles[0]
		if (!["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"].includes(dataFile.type)){
			console.error("Wrong file type")
			return
		}

		const imageFile = dataFile
		const imageURL = URL.createObjectURL(imageFile)
		setAddProduct(op=>{return {
			...op,
			productImageURL: imageURL,
			productImageFile: imageFile
		}})
		setChangedImage(true)
		setFileActive(false)
	}
	const dragEnter: DragEventHandler<HTMLDivElement> = (e) => {
		stopProp(e)
		setFileActive(true)
	}
	const dragLeave: DragEventHandler<HTMLDivElement> = (e) => {
		stopProp(e)
		setFileActive(false)
	}

	return (
		<Transition show={open} as={Fragment}>
			<Dialog onClose={closeModal}>
				{/*
          Use one Transition.Child to apply one transition to the backdrop...
        */}
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/30" />
				</Transition.Child>

				{/*
          ...and another Transition.Child to apply a separate transition
          to the contents.
        */}
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0 translate-y-6"
					enterTo="opacity-100 translate-y-0"
					leave="ease-in duration-200"
					leaveFrom="opacity-100 translate-y-0"
					leaveTo="opacity-0 translate-y-6"
				>
					<div className="fixed inset-0 flex items-center justify-center p-4">
						<form className="bg-white z-20 max-h-[90vh] overflow-scroll rounded-xl w-[37rem]" onSubmit={addProductSubmit}>
							<Dialog.Panel>
								<div className="sticky top-0 bg-white">
									<div className="flex flex-row p-8 px-12 pb-2 justify-between">
										<Dialog.Title className="text-3xl font-bold">{toSentenceCase(mode)} Product</Dialog.Title>
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
										onDrop={dropListener} onDragEnter={dragEnter} onDragLeave={dragLeave} onDragOver={stopProp}
										className={`border-2 border-zinc-400 ${fileActive ? "!border-blue-500" : ""}
										rounded-xl border-dashed flex flex-col justify-center items-center col-span-2 p-10 py-4`}
									>
										{
											addProduct.productImageURL &&
											<img id="outImage" src={addProduct.productImageURL} alt="Product Image" className="mb-4 w-16" />
										}
										
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
											className="w-6 h-6">
											<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
										</svg>
										<input className="hidden" onChange={addProductChange} type="file" id="productImageFile" accept='image/jpeg, image/png' />
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
										<InputField handleChange={addProductChange} label="Product Name"
											productKey="productName" defaultValue={addProduct.productName}/>
									</div>

									<div className="flex flex-row gap-x-2 col-span-2 text-lg">
										<label
											className={`block select-none text-sm transition-colors hover:cursor-pointer p-1 px-4 border-2 border-zinc-400 rounded-xl outline-none focus:ring-2 ${addProduct.residential && "text-white bg-blue-600 border-blue-700"}`}
											tabIndex={0} htmlFor="residential"
										>	
											Residential
											<input className="hidden" onChange={addProductChange} type="checkbox" name="" id="residential" defaultChecked={addProduct.residential} />
										</label>
										<label
											className={`block select-none text-sm transition-colors hover:cursor-pointer p-1 px-4 border-2 border-zinc-400 rounded-xl outline-none focus:ring-2 ${addProduct.commercial && "text-white bg-blue-600 border-blue-700"}`}
											tabIndex={0} htmlFor="commercial"
										>
											Commercial
											<input className="hidden" onChange={addProductChange} type="checkbox" name="" id="commercial" defaultChecked={addProduct.commercial} />
										</label>
										<label
											className={`block select-none text-sm transition-colors hover:cursor-pointer p-1 px-4 border-2 border-zinc-400 rounded-xl outline-none focus:ring-2 ${addProduct.industrial && "text-white bg-blue-600 border-blue-700"}`}
											tabIndex={0} htmlFor="industrial"
										>
											Industrial
											<input className="hidden" onChange={addProductChange} type="checkbox" name="" id="industrial" defaultChecked={addProduct.industrial} />
										</label>
									</div>

									<InputField handleChange={addProductChange} label="Quantity"
										productKey="quantity" defaultValue={addProduct.quantity} numberValue={true} />
									<InputField handleChange={addProductChange} label="Price" unit="$CAD"
										productKey="price" defaultValue={addProduct.price} numberValue={true}/>

									<InputField handleChange={addProductChange} label="Weight" unit="kg"
										productKey="weight" defaultValue={addProduct.weight} numberValue={true} />
									
									<div className="flex flex-row gap-x-2 justify-around">
										<InputField handleChange={addProductChange} label="Width" unit="cm" productKey="width"
											defaultValue={addProduct.width} numberValue={true} className="!w-16" />
										<InputField handleChange={addProductChange} label="Height" unit="cm" productKey="height"
											defaultValue={addProduct.height} numberValue={true} className="!w-16" />
										<InputField handleChange={addProductChange} label="Length" unit="cm" productKey="length"
											defaultValue={addProduct.length} numberValue={true} className="!w-16" />
									</div>

									<div className="col-span-2">
										<label className="block text-sm" htmlFor="description">Description</label>
										<textarea
											className="block border-2 border-zinc-400 w-full max-h-32 rounded-md py-1 px-2 outline-none focus:ring-2 text-lg"
											onChange={addProductChangeTA} name="description" id="description" defaultValue={addProduct.description}
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
													: `${toSentenceCase(mode)} Item`
											}
										</button>
									</div>
								</div>
							</Dialog.Panel>
						</form>
					</div>
				</Transition.Child>
			</Dialog>
		</Transition>
	)
}

const useUpdatingProducts = ()=>{
	const [products, setProducts] = useState<ProductInterface[]>([])
	const [initialLoaded, setInitialLoaded] = useState(false)
	const [pendingItems, setPendingItems] = useState<ProductInterface[]>([])
	const [pendingEmpty, setPendingEmpty] = useState(false)

	useEffect(() => {
		if (pendingItems.length == 0) {
			if (initialLoaded) setPendingEmpty(true)
			return
		}
		setProducts(items => [...items, pendingItems.at(0)!])
		setTimeout(() => setPendingItems(pi => pi.slice(1, pi.length)), 70);
	}, [pendingItems])

	// listen to new product changes
	useEffect(() => {
		const unSubProducts = onSnapshot(query(collection(db, "products"), orderBy("productName")), (snapshot) => {
			console.log(...firebaseConsoleBadge, 'Admin Product Snapshot Updated');
			const newProducts = snapshot.docs.map(productDoc => fillProductDoc(productDoc))

			Promise.all(newProducts).then(newProducts => {
				if (initialLoaded) setProducts(newProducts)
				else setPendingItems(pi => pi.concat(newProducts))
			})
			setInitialLoaded(true)
		})
		return unSubProducts
	}, [])

	return { products, initialLoaded, pendingEmpty }
}

type ProductComponentProps = { newProductModal: () => void, openEditModal: (p: ProductInterface) => void }
export const ProductsComponent = ({ newProductModal, openEditModal }: ProductComponentProps) => {
	const { products, initialLoaded, pendingEmpty } = useUpdatingProducts()
	const deleteProduct = (id: string) => deleteDoc(doc(db, "products", id))
	const item = {
		hidden: { opacity: 0, y: "20%" },
		show: { opacity: 1, y: 0 }
	}

	return (
		<div className="relative">
			<AnimatePresence mode="wait">
				{
					initialLoaded ?
					<motion.div className="grid grid-cols-3 gap-x-1 gap-y-1" key="products">
						<AnimatePresence mode="popLayout">
							{products.map(product =>
								<motion.div
									className="flex flex-row py-4 px-3 items-center gap-x-2 rounded bg-slate-200 shadow-sm"
									variants={item} initial="hidden" animate="show" transition={{ ease: "easeInOut" }} layout
									key={product.firestoreID}
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
									<p onClick={() => openEditModal(product)} className="hover:cursor-pointer shrink-0	">edit</p>
									<svg className="w-6 h-6 hover:cursor-pointer shrink-0	" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
										onClick={() => deleteProduct(product.firestoreID)}>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</motion.div>
							)}
						</AnimatePresence>
						{/* ADD PRODUCT BUTTON */}
						{
							pendingEmpty &&
							<motion.button
								onClick={newProductModal}
								className="w-full rounded-lg border-[3px] transition-colors flex items-center justify-center p-2 hover:border-slate-400 hover:bg-slate-200 group"
								layout initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 1}} key="button"
							>
								<svg className="w-10 h-10 stroke-slate-400 group-hover:stroke-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.35} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</motion.button>
						}
					</motion.div>
					// LOADING
					:
					<motion.div className="left-[50%] translate-x-[-50%] py-4 absolute"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						key="loading"
					>
						<Oval width={120} height={120} />
					</motion.div>
				}
			</AnimatePresence>
		</div>
	)
}