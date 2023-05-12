// next
import { useRouter } from 'next/router'
import { RefObject, useEffect, useRef, useState } from 'react';
import Head from 'next/head';

// firebase
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { auth } from "util/firebase/auth"
import { db } from 'util/firebase/firestore';

// types
import ProductInterface from 'types/product';

// UI
import LoadingFullPage from 'components/loadingFullPage';
import { ProductsComponent, ProductModal } from '../../components/admin/ProductsComponents';
import { OrdersComponent } from '../../components/admin/OrdersComponent';
import { AnimatePresence } from 'framer-motion';
import { AdminInterface } from 'types/admin';
import AnalyticsComponent from 'components/admin/AnalyticsComponent';
import Link from 'next/link';

interface SidebarButtonProps{
	name: "Orders" | "Products" | "Analytics",
	scrollRef: RefObject<HTMLDivElement>
}
const SidebarButton = ({name, scrollRef}: SidebarButtonProps)=>{
	const icon = {
		"Orders": (<path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />),
		"Products": (<path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />),
		"Analytics": (<><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></>)
	}

	return(
		<div className="
			group
			flex flex-row items-center gap-x-3
			px-4 py-4 mx-0 relative rounded-md
			hover:bg-gray-200
			transition-colors overflow-hidden
			hover:cursor-pointer
		"
			onClick={() => scrollRef.current?.scrollIntoView()}>
			{/* <div className="h-full w-[5px] rounded-r-md bg-blue-500 absolute left-0 translate-x-[-5px] group-hover:translate-x-0 transition-transform"/> */}
			<svg className="w-6 h-6 fill-black group-hover:fill-blue-500" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> {icon[name]} </svg>
			<p className="text-black text-xl group-hover:text-blue-500">{name}</p>
		</div>
	)
}



const Admin = () => {
	const router = useRouter()
	// auth
	const [loading, setLoading] = useState(true)
	const [admin, setAdmin] = useState<AdminInterface>({} as AdminInterface);

	// push back to login page, or start admin login
	useEffect(()=>{
		onAuthStateChanged(auth, (authUser) => {
			if (!authUser) router.push('/admin/login')
			else setUpPage(authUser)
		})
	}, [])
	const setUpPage = async (authUser: User) =>{
		const adminUser = await getDoc(doc(db, "admins", authUser.uid)).catch(err => { console.error(err) })

		const adminUserData = adminUser?.data() as AdminInterface
		if (!adminUserData) {
			router.push('/admin/login')
			return
		}
		setAdmin(adminUserData)
		setLoading(false)
	}

	const signout = ()=>{ signOut(auth).catch((error) => { console.error("Sign out error: ", error); }); }

	// edit product modal
	const [editProduct, setEditProduct] = useState<ProductInterface>({} as ProductInterface)
	const [editModalOpen, setEditModalOpen] = useState(false)
	const openEditModal = (p: ProductInterface) => setEditProduct(p)
	const closeEditModal = () => setEditProduct({} as ProductInterface)
	useEffect(()=> setEditModalOpen(Object.keys(editProduct).length != 0), [editProduct])

	const [newProduct, setNewProduct] = useState<ProductInterface>({} as ProductInterface)
	const [newModalOpen, setNewModalOpen] = useState(false)
	const openNewModal = ()=>{
		setNewProduct({} as ProductInterface)
		setNewModalOpen(true)
	}
	const closeNewModal = ()=> setNewModalOpen(false)

	// Sidebar scrolling
	const analytics = useRef<HTMLDivElement>(null)
	const orders = useRef<HTMLDivElement>(null)
	const products = useRef<HTMLDivElement>(null)

	if (loading) return <LoadingFullPage />
	return (
		<>
		<Head>
			<title>Admin | JHY Electrical</title>
		</Head>
		
		{/* edit modal */}
		<ProductModal open={editModalOpen} product={editProduct} mode="edit" closeModal={closeEditModal}/>
		{/* new product modal */}
		<ProductModal open={newModalOpen} product={newProduct} mode="new" closeModal={closeNewModal}/>
		<div className="flex flex-row gap-x-2">
			{/* sidebar */}
			<div className="flex-[1.7] overflow-hidden rounded-xl bg-zinc-100 flex flex-col sticky top-0 max-h-screen p-6">
				<div className="flex-[1]">
					<div className="flex flex-row items-center justify-center">
						<Link href="/"> <img src="./logo.svg" alt="" className="w-20 mr-2"/> </Link>
						<Link href="/"> <p className="font-bold text-2xl hover:underline">JHY Electrical</p> </Link>
					</div>
				</div>
				<div className="flex-[2] flex items-center flex-col">
					<div className="rounded-full overflow-hidden p-4 bg-white inline-block">
							<img className="h-16 w-16" src={admin.profileImageURL} alt="" />
					</div>
					<h1 className="text-2xl font-bold mb-4">{admin.name}</h1>
					{/* TODO Implement this behaviour */}
					<button className="rounded-full px-5 py-1 border-2 border-slate-800">Edit</button>
				</div>
				<div className="flex-[4] text-lg h-min flex flex-col gap-y-1">
					<SidebarButton name="Analytics" scrollRef={analytics}/>
					<SidebarButton name="Orders" scrollRef={orders}/>
					<SidebarButton name="Products" scrollRef={products}/>
				</div>
				<div>
					<button onClick={signout} className="rounded-lg flex w-full items-center flex-row p-4 hover:bg-gray-200">
						<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
						<p>Log Out</p>
					</button>
				</div>
			</div>

			{/* content */}
			<div className="flex-[8] min-h-screen pl-4 pt-8 p-2 pb-10">
				{/* analytics */}
				<h1 className="text-4xl font-bold mb-4" id="analytics" ref={analytics}>Analytics</h1>
				<AnalyticsComponent />

				{/* orders */}
				<h1 className="text-4xl font-bold mb-4 mt-7" id="orders" ref={orders}>Orders</h1>
				<OrdersComponent />
				
				{/* products */}
				<h1 className="text-4xl font-bold mb-4 mt-7" id="products" ref={products}>Products</h1>
				<ProductsComponent
					newProductModal={openNewModal}
					openEditModal={openEditModal}
				/>
			</div>
		</div>
		</>
	);
}

export default Admin;