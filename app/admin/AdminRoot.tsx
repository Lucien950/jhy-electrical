"use client"
// next
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
// firebase
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query, doc, getDoc } from "firebase/firestore";
import { auth } from "util/firebase/auth";
import { db } from 'util/firebase/firestore';
// types
import { AdminInterface } from 'types/admin';
import { CompletedOrder, Order } from 'types/order';
// UI
import LoadingFullPage from 'components/loadingFullPage';
import ProductsComponent from 'app/admin/product/ProductsComponent';
import OrdersComponent from 'app/admin/OrdersComponent';
import AnalyticsComponent from 'app/admin/AnalyticsComponent';
import { firebaseConsoleBadge } from 'util/firebase/console';
import { toast } from 'react-toastify';
import { UnserializeOrder } from 'util/order';
import { SidebarButton, SidebarButtonType } from './login/SidebarButton';

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
const useLiveOrders = () => {
	const [allOrders, setAllOrders] = useState<Order[]>([])
	useEffect(() => {
		const unsubOrders = onSnapshot(
			query(collection(db, "orders"),
				orderBy("completed", "asc"),
				orderBy("dateTS", "desc"), orderBy("__name__", "asc")),
			(querySnapshot) => {
				console.log(...firebaseConsoleBadge, 'Admin Orders Listing Snapshot Updated');
				// setAllOrders(querySnapshot.docs.map(d => d.data()) as OrderInterface[])
				const newOrders = querySnapshot.docs.map(d => UnserializeOrder(d.data() as CompletedOrder, d.id))
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

export default function AdminRoot() {
	const { authLoading, admin, signout } = useGoogleAuth()
	const { allOrders } = useLiveOrders()

	// Sidebar scrolling
	const analyticSection = useRef<HTMLDivElement>(null)
	const orderSection = useRef<HTMLDivElement>(null)
	const productSection = useRef<HTMLDivElement>(null)

	if (authLoading) return <LoadingFullPage />
	return (
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
				</div>
				<div className="flex-[4] text-lg h-min flex flex-col gap-y-1 py-2 lg:self-stretch">
					<SidebarButton name={SidebarButtonType.Analytics} scrollRef={analyticSection} />
					<SidebarButton name={SidebarButtonType.Orders} scrollRef={orderSection} />
					<SidebarButton name={SidebarButtonType.Products} scrollRef={productSection} />
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
	);
}