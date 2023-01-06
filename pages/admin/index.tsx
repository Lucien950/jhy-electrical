// next
import { useRouter } from 'next/router'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// firebase
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import auth from "util/firebase/auth"
import storage from "util/firebase/storage"
import { fillProductDoc } from 'util/fillProduct';
import db from 'util/firebase/firestore';

// types
import { order, firestoreOrder, productInfo } from 'types/order';
import productType from 'types/product';

// UI
import LoadingFullPage from 'components/loadingFullPage';
import { CircleLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarButtonProps{
	name: "Orders" | "Products" | "Analytics"
}
const SidebarButton = ({name}: SidebarButtonProps)=>{
	const icon = {
		"Orders": (<svg className="w-6 h-6 fill-black group-hover:fill-blue-500" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
					<path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
					</svg>),
		"Products": (<svg className="w-6 h-6 fill-black group-hover:fill-blue-500" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
					<path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
					</svg>),
		"Analytics": (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>)
	}
	return(
		<a href={`#${name.toLowerCase()}`}>
			<div className="
				group
				flex flex-row items-center gap-x-3
				px-4 py-1 mx-0 relative
				hover:bg-gray-200
				transition-colors overflow-hidden
			">
				<div className="h-full w-[5px] rounded-r-md bg-blue-500 absolute left-0 translate-x-[-5px] group-hover:translate-x-0 transition-transform"/>
				{icon[name]}
				<p className="text-black group-hover:text-blue-500">
					{name}
				</p>
			</div>
		</a>
	)
}

const ProductModal = ({ closeProductModal, editProduct }: { closeProductModal: () => void, editProduct: productType })=>{
	const [addProduct, setAddProduct] = useState(Object.keys(editProduct).length!= 0 ? editProduct : {
		productName: "",
		quantity: -1,
		price: -1,
		description: "",

		commercial: false,
		industrial: false,
		residential: false,
	} as productType)
	const mode = Object.keys(editProduct).length != 0 ? "edit" : "new"
	const [uploading, setUploading] = useState(false)

	const addProductChange = (e: ChangeEvent<HTMLInputElement>) => {
		const productAttribute = e.target.id
		if (productAttribute == null) {
			console.error("Could not get add_product_attribute (ID)")
			return
		}
		// checkboxes
		if (e.target.type == "checkbox") {
			setAddProduct(oldAddProduct => {
				(oldAddProduct as any)[productAttribute] = e.target.checked
				return oldAddProduct
			})
			return
		}
		// textboxes
		if (e.target.type == "text") {
			let inputFieldValue: string | number = e.target.value
			const isNumberValue = e.target.getAttribute("data-numberValue") === "true"
			console.log("is number value, value", isNumberValue)
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
			var fr = new FileReader();
			fr.onload = () => {
				const fileReadResult = fr.result
				if (typeof (fileReadResult) != "string"){
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
	const addProductChangeTA = (e: ChangeEvent<HTMLTextAreaElement>)=>{
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
		if(addProduct.productImageFile){
			// upload image to storage
			if (addProduct.productImageFile){
				const snapshotFile = await uploadBytes(productImageRef, addProduct.productImageFile).catch(e => {
					console.error(e)
				})
				if (!snapshotFile) {
					console.error("[Firebase Storage Error] file upload error")
					setUploading(false)
					return
				}
				console.log("Image Upload Successful")
			}
		}

		// upload new product to firebase
		const { productImageURL, productImageFile, firestoreID, ...firestoreAddProduct} = addProduct

		let error = false;
		if(mode == "edit"){
			await setDoc(doc(db, "products", firestoreID), firestoreAddProduct)
			.catch(e => {
				console.error("[Firestore Error] Firestore Write Error", e)
				setUploading(false)
				error = true
			});
		}
		else{
			await addDoc(collection(db, "products"), firestoreAddProduct).catch(e => {
				console.error("[Firestore Error] Firestore Write Error", e)
				setUploading(false)
				error = true
			});
		}
		if (error && mode == "new") {
			await deleteObject(productImageRef).catch(e => {
				console.error("[Firebase File Upload Error] Storage Delete Failure", e)
			})
			return
		}

		console.log("Firestore Update Success")

		closeProductModal()
	}

	const InputField = (
		{ label, defaultValue, numberValue = false, className, productKey } :
		{ label: string, defaultValue: string | number, numberValue?: boolean, className?: string, productKey: string }
	)=>{
		if(typeof defaultValue == "number" && defaultValue == -1) defaultValue = ""
		return(
			<div>
				<label className="block" htmlFor={productKey}>{label}</label>
				<input className={`block border-2 rounded-md p-1 focus:outline-none focus:ring-2 ${className ? className : ""}`} onChange={addProductChange} data-numbervalue={numberValue} type="text" id={productKey} defaultValue={defaultValue}/>
			</div>
		)
	}
	
	return(
		<>
		<div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-30 z-20" onClick={closeProductModal}/>
		<form	
			className="
				fixed top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] bg-white z-20
				p-4 flex flex-col gap-y-2 max-h-[85vh] overflow-scroll
			"
			onSubmit={addProductSubmit}
		>
			<div>
				<svg onClick={closeProductModal} className="w-6 h-6 hover:cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
				</svg>
			</div>
			<div>
				<h1>Image</h1>
				<label htmlFor="productImageFile" className="hover:cursor-pointer border-2 p-2 inline-block">Upload Product Image</label>
				<input className="hidden" onChange={addProductChange} type="file" id="productImageFile" accept='image/jpeg, image/png'/>
				<img id="outImage" src={addProduct.productImageURL} alt="Product Image" className="mx-auto w-7/12"/>
			</div>
			<InputField label="Product Name" productKey="productName" defaultValue={addProduct.productName}/>
			<InputField label="Quantity" productKey="quantity" defaultValue={addProduct.quantity} numberValue={true}/>
			<InputField label="Price" productKey="price" defaultValue={addProduct.price} numberValue={true} />
			<div className="flex flex-row gap-x-2">
				<InputField label="Width (cm)" productKey="width" defaultValue={addProduct.width} numberValue={true} className="w-16"/>
				<InputField label="Height (cm)" productKey="height" defaultValue={addProduct.height} numberValue={true} className="w-16"/>
				<InputField label="Length (cm)" productKey="length" defaultValue={addProduct.length} numberValue={true} className="w-16"/>
			</div>
			<InputField label="Weight (kg)" productKey="weight" defaultValue={addProduct.weight} numberValue={true}/>

			<div className="flex flex-row justify-between">
				<label className="block" htmlFor="residential">Residential</label>
				<input className="block" onChange={addProductChange} type="checkbox" name="" id="residential" defaultChecked={addProduct.residential}/>
			</div>
			<div className="flex flex-row justify-between">
				<label className="block" htmlFor="commercial">Commercial</label>
				<input className="block" onChange={addProductChange} type="checkbox" name="" id="commercial" defaultChecked={addProduct.commercial}/>
			</div>
			<div className="flex flex-row justify-between">
				<label className="block" htmlFor="industrial">Industrial</label>
				<input className="block" onChange={addProductChange} type="checkbox" name="" id="industrial" defaultChecked={addProduct.industrial}/>
			</div>
			<div>
				<label className="block" htmlFor="description">Description</label>
					<textarea className="block border-2 w-full max-h-32" onChange={addProductChangeTA} name="description" id="description" defaultValue={addProduct.description} />
			</div>
			<button type="submit" className="border-2 px-4 flex justify-center" disabled={uploading}>
				{
					uploading
					? <CircleLoader size={24}/>
					: `${mode.charAt(0).toUpperCase() + mode.slice(1)} Item`
				}
			</button>
		</form>
		</>
	)
}

const ProductsComponent = ({ openProductModal, editProductModal }: { openProductModal: ()=>void, editProductModal: (p: productType)=>void })=>{
	const [products, setProducts] = useState([] as productType[])
	const [initialLoaded, setInitialLoaded] = useState(false)

	// listen to new product changes
	useEffect(() => {
		const unSubProducts = onSnapshot(query(collection(db, "products"), orderBy("productName")), (snapshot) => {
			const newProducts = snapshot.docs.map(productDoc => fillProductDoc(productDoc))
			Promise.all(newProducts).then(newProducts => setProducts(newProducts))
		})
		return unSubProducts
	}, [])
	// loaded after recieving products once
	useEffect(()=>{
		if(products.length > 0) setInitialLoaded(true)
	}, [products])

	// edit/delete buttons
	const productEdit = (id: string)=>{
		editProductModal(products.find(p => p.firestoreID == id)!)
	}
	const deleteProduct = (id: string)=>{
		deleteDoc(doc(db, "products", id))
	}

	const container = {
		hidden: {},
		show: { transition: { staggerChildren: 0.1 } }
	}
	const item = {
		hidden: { opacity: 0, y: "20%" },
		show: { opacity: 1, y: 0 }
	} 

	return(
		<div className="relative">
			<AnimatePresence>
				{
					initialLoaded ?
					<motion.div
						className="w-full flex flex-col gap-y-2"
						key="products"
						variants={container}
						initial="hidden"
						animate="show"
						layout
					>
						{products.map(product =>
							//PRODUCT ELEMENT
							<motion.div
								className="flex flex-row p-2 items-center gap-x-2 rounded bg-gray-300"
								key={product.firestoreID}
								variants={item}
								exit={{x:"100%"}}
								// transition={{ ease: "easeOut", duration: 1, delay: 0.4 }}
							>
								<img src={product.productImageURL} alt="" className="h-12" />
								<p>{product.productName}</p>
								<p>{product.quantity}</p>
								<p>${product.price}</p>
								<p>{product.commercial} {product.industrial} {product.residential}</p>
								<p>{product.width}cm x {product.height}cm x {product.length}cm</p>
								<p>{product.weight} kg</p>
								<p onClick={() => productEdit(product.firestoreID)} className="hover:cursor-pointer">edit</p>
								<svg className="w-6 h-6 hover:cursor-pointer" onClick={() => deleteProduct(product.firestoreID)} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
							</motion.div>
						)}
						{/* ADD PRODUCT BUTTON */}
						<motion.button
							onClick={openProductModal}
							className="w-full rounded-lg border-2 bg-green-400 border-green-600 flex justify-center p-2"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</motion.button>
					</motion.div>
					:
					// LOADING
					<motion.div className="left-[50%] translate-x-[-50%] py-4 absolute"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{duration:0.3}}
						key="loading"
					>
						<CircleLoader size={120} />
					</motion.div>
				}
			</AnimatePresence>
		</div>
	)
}

const OrdersComponent = ()=>{
	const [orders, setOrders] = useState([] as order[])
	// update orders
	useEffect(() => {
		const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("dateTS")), (querySnapshot) => {
			const newOrders = querySnapshot.docs.map(async orderDoc => {
				const preOrder = orderDoc.data() as firestoreOrder
				const products = await Promise.all(preOrder.products.map(async (productInfo)=>{
					const productDoc = await getDoc(doc(db, "products", productInfo.PID));
					const product = productDoc.data() as productType;
					return {
						...productInfo,
						product
					} as productInfo;
				}))
				return {
					products,
					date: preOrder.dateTS.toDate(),
					orderID: orderDoc.id
				} as order
			})

			Promise.all(newOrders).then(newOrders => {
				setOrders(newOrders)
			})
		})
		return () => unsubOrders();
	}, [])

	return(
		<>
		<style jsx>{`
		tbody tr:nth-child(odd){
			background-color: rgb(209 213 219)
		}
		`}</style>

		<div>
			<div className="grid grid-cols-3 font-bold">
				<div>Order ID</div>
				<div>Date/Time of Order</div>
			</div>
			{orders.map((order, i) =>
				<div key={i} className="grid grid-cols-3">
					<div>
						<Link href={`/order/${order.orderID}`}>
							{order.orderID}
						</Link>
					</div>
					<div>{order.date.toLocaleDateString()} {order.date.toLocaleTimeString()}</div>
					<div>{
						order.products.map(productInfo=>productInfo.product!.productName).join(", ")
					}</div>
				</div>
			)}
		</div>
		<button>Load more</button>
		</>
	)
}

const Admin = () => {
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [editProduct, setEditProduct] = useState({} as productType)

	const [productModalOpen, setProductModalOpen] = useState(false)
	const [adminUserName, setAdminUserName] = useState("");

	useEffect(()=>{
		onAuthStateChanged(auth, (authUser) => {
			if (!authUser) router.push('/admin/login')
			else setUpPage(authUser)
		})
	}, [])
	const setUpPage = async (authUser: User) =>{
		const adminUser = await getDoc(doc(db, "admins", authUser.uid))
			.catch(err => {
				console.error(err)
			})
		if (!adminUser) {
			router.push('/admin/login')
			return
		}
		const data = adminUser.data()!
		setAdminUserName(data.name)
		setLoading(false)
	}
	const signOutEvent = ()=>{
		signOut(auth)
		.catch((error) => {
			console.error("Sign out error: ", error);
		});
	}
	const editProductModal = (p: productType)=>{
		setEditProduct(p)
	}
	useEffect(()=>{
		if(Object.keys(editProduct).length != 0) setProductModalOpen(true)
	}, [editProduct])
	useEffect(() => {
		document.body.style.overflow = productModalOpen ? "hidden" : "unset";
	}, [productModalOpen])

	if(loading){
		return(
			<LoadingFullPage />
		)
	}
	return (
		<>
		<Head>
			<title>Admin | JHY Electrical</title>
		</Head>
		{
			productModalOpen && <ProductModal closeProductModal={() => { setProductModalOpen(false);setEditProduct({} as productType) }} editProduct={editProduct}/>
		}
		<div className="grid grid-cols-5 container mx-auto pt-24">
			{/* sidebar */}
			<div className="col-span-1 border-r-2 relative overflow-hidden">
				<div className="sticky top-[4rem] text-lg h-min">
					<SidebarButton name="Analytics"/>
					<SidebarButton name="Orders"/>
					<SidebarButton name="Products"/>
				</div>
			</div>

			{/* content */}
			<div className="col-span-4 p-2 min-h-screen">
				{/* greeter */}
				<div className="flex flex-row justify-between w-full">
					<h1 className="text-5xl font-bold mb-4">Hello {adminUserName}</h1>
					<button onClick={signOutEvent} className="border-2 rounded-lg h-12 w-12 grid place-items-center">
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
					</button>
				</div>

				{/* analytics */}
				<h1 className="text-4xl font-bold mb-4 mt-7" id="analytics">Analytics</h1>
				<div></div>

				{/* orders */}
				<h1 className="text-4xl font-bold mb-4 mt-7" id="orders">Orders</h1>
				<OrdersComponent />
				
				{/* products */}
				<h1 className="text-4xl font-bold mb-4 mt-7" id="products">Products</h1>
				<ProductsComponent
					openProductModal={()=>{setProductModalOpen(true)}}
					editProductModal={editProductModal}
				/>
			</div>
		</div>
		</>
	);
}

export default Admin;