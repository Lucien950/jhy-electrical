"use client"
// next
import { RefObject, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import Head from 'next/head';
// firebase
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query, doc, getDoc } from "firebase/firestore";
import { auth } from "util/firebase/auth";
import { db } from 'util/firebase/firestore';
// types
import { AdminInterface } from 'types/admin';
import { FirebaseOrderInterface, OrderInterface } from 'types/order';
// UI
import LoadingFullPage from 'components/loadingFullPage';
import { ProductsComponent } from 'app/admin/ProductsComponents';
import { OrdersComponent } from 'app/admin/OrdersComponent';
import AnalyticsComponent from 'app/admin/AnalyticsComponent';
import { firebaseConsoleBadge } from 'util/firebase/console';
import { toast } from 'react-toastify';
import { UnserializeOrder } from 'util/order';

interface SidebarButtonProps {
	name: "Orders" | "Products" | "Analytics",
	scrollRef: RefObject<HTMLDivElement>
}
const SidebarButton = ({ name, scrollRef }: SidebarButtonProps) => {
	const icon = {
		"Orders": (<path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />),
		"Products": (<path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />),
		"Analytics": (<><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></>)
	}

	return (
		<div tabIndex={0} onClick={() => scrollRef.current?.scrollIntoView()}
			className="
				group
				flex flex-row items-center gap-x-3
				px-4 py-4 mx-0 relative rounded-md
				hover:bg-gray-200
				transition-colors overflow-hidden
				hover:cursor-pointer
				outline-none focus:ring-4
				lg:w-full
			"
		>
			{/* <div className="h-full w-[5px] rounded-r-md bg-blue-500 absolute left-0 translate-x-[-5px] group-hover:translate-x-0 transition-transform"/> */}
			<svg className="w-8 h-8 fill-black group-hover:fill-blue-500" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> {icon[name]} </svg>
			<p className="hidden lg:block text-black text-xl group-hover:text-blue-500">{name}</p>
		</div>
	)
}

// HOOKS
const useGoogleAuth = () => {
	const router = useRouter()
	const [authLoading, setAuthLoading] = useState(true)
	const [admin, setAdmin] = useState<AdminInterface>({} as AdminInterface);
	const signout = () => { signOut(auth).catch((error) => { toast.error("Sign out error: ", error); }); }
	// push back to login page, or start admin login
	useEffect(() => {
		onAuthStateChanged(auth, (authUser) => {
			if (!authUser) router.push('/admin/login')
			else {
				(async () => {
					const adminUser = await getDoc(doc(db, "admins", authUser.uid))
					const adminUserData = adminUser?.data() as AdminInterface
					if (!adminUserData) return router.push('/admin/login')
					setAdmin(adminUserData)
					setAuthLoading(false)
				})()
			}
		})
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return { authLoading, admin, signout }
}
const useOrders = () => {
	const [allOrders, setAllOrders] = useState<OrderInterface[]>([])
	useEffect(() => {
		const unsubOrders = onSnapshot(
			query(collection(db, "orders"),
				orderBy("completed", "asc"),
				orderBy("dateTS", "desc"), orderBy("__name__", "asc")),
			(querySnapshot) => {
				console.log(...firebaseConsoleBadge, 'Admin Orders Listing Snapshot Updated');
				// setAllOrders(querySnapshot.docs.map(d => d.data()) as OrderInterface[])
				const newOrders = querySnapshot.docs.map(d => UnserializeOrder(d.data() as FirebaseOrderInterface, d.id))
				setAllOrders(newOrders)
			},
			(error) => {
				if (error.code === "permission-denied") return
				console.log(...firebaseConsoleBadge, 'Admin Orders Listing Error: ', error);
				toast.error("Admin Orders Listing Error, check console for more information")
			}
		)
		return () => unsubOrders();
	}, [])

	return { allOrders }
}

export default function Admin() {
	const { authLoading, admin, signout } = useGoogleAuth()
	const { allOrders } = useOrders()

	// Sidebar scrolling
	const analyticSection = useRef<HTMLDivElement>(null)
	const orderSection = useRef<HTMLDivElement>(null)
	const productSection = useRef<HTMLDivElement>(null)

	if (authLoading) return <LoadingFullPage />
	return (
		<>
			<Head>
				<title>Admin | JHY Electrical</title>
			</Head>

			<div className="flex flex-row gap-x-2">
				{/* sidebar */}
				<div className="lg:flex-[1.7] overflow-hidden rounded-xl bg-zinc-100 flex flex-col items-center lg:items-start sticky top-0 max-h-screen py-6 px-2 lg:px-6">
					<div className="flex-[1]">
						<div className="flex flex-col 2xl:flex-row items-center justify-center">
							<Link href="/"> <img src="./logo.svg" alt="" className="w-16 lg:w-20 2xl:mr-2" /> </Link>
							<Link href="/"> <p className="hidden lg:block font-bold text-2xl hover:underline text-center">JHY Electrical</p> </Link>
						</div>
					</div>
					<div className="flex-[2] flex items-center flex-col self-center">
						<div className="rounded-full overflow-hidden p-4 bg-white inline-block">
							<img className="h-10 w-10 lg:h-16 lg:w-16" src={admin.profileImageURL} alt="" />
						</div>
						<h1 className="hidden lg:block text-2xl font-bold mb-4">{admin.name}</h1>
						{/* TODO Implement this behaviour */}
						{/* <button className="rounded-full px-5 py-1 border-2 border-slate-800 outline-none focus:ring-2">Edit</button> */}
					</div>
					<div className="flex-[4] text-lg h-min flex flex-col gap-y-1 py-2 lg:self-stretch">
						<SidebarButton name="Analytics" scrollRef={analyticSection} />
						<SidebarButton name="Orders" scrollRef={orderSection} />
						<SidebarButton name="Products" scrollRef={productSection} />
					</div>
					<div className="lg:self-stretch">
						<button onClick={signout} className="rounded-lg flex w-full items-center flex-row p-4 hover:bg-gray-200">
							<svg className="w-5 h-5 lg:mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
							<p className="hidden lg:block">Log Out</p>
						</button>
					</div>
				</div>

				{/* content */}
				<div className="flex-[8] min-h-screen pl-4 pt-8 p-2 pb-10">
					{/* analytics */}
					<h1 className="text-4xl font-bold mb-4" id="analytics" ref={analyticSection}>Analytics</h1>
					<AnalyticsComponent allOrders={allOrders} />

					{/* orders */}
					<h1 className="text-4xl font-bold mb-4 mt-7" id="orders" ref={orderSection}>Orders</h1>
					<OrdersComponent allOrders={allOrders} />

					{/* products */}
					<h1 className="text-4xl font-bold mb-4 mt-7" id="products" ref={productSection}>Products</h1>
					<ProductsComponent />
				</div>
			</div>
		</>
	);
}