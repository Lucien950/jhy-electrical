// react
import { Fragment, useState } from "react"
import Link from "next/link"
// firebase
import { OrderInterface } from 'types/order'
// UI
import { AnimatePresence, motion } from "framer-motion"
import { Tab } from "@headlessui/react"
import { doc, setDoc } from "firebase/firestore"
import { db } from "util/firebase/firestore"


const TableRow = ({ order }: { order: OrderInterface }) => {
	const toggleComplete = () => {
		setDoc(doc(db, 'orders', order.firebaseOrderID), { completed: !order.completed }, { merge: true });
	}
	return (
		<tr className="odd:bg-white even:bg-gray-100 border-b border-x group" data-completed={order.completed}>
			<td className="px-4 py-3">
				<Link href={`/order/${order.firebaseOrderID}`} target="_blank" className="underline text-blue-500 visited:text-purple-500 group-data-[completed=true]:opacity-50">
					{order.firebaseOrderID}
				</Link>
			</td>
			<td className="px-4 py-3">
				<p className="group-data-[completed=true]:opacity-25"> {order.date.toLocaleDateString()} {order.date.toLocaleTimeString()} </p>
			</td>
			<td className="px-4 py-3 overflow-hidden relative">
				<p className="whitespace-nowrap group-data-[completed=true]:opacity-25">
					{
						order.products.map(productInfo => productInfo.product ? `${productInfo.product.productName} x ${productInfo.quantity}` : `INVALID PRODUCT ID ${productInfo.PID}`).join(", ")
					}
				</p>
				<div className="absolute h-full w-24 right-0 top-0 bg-gradient-to-r from-transparent group-odd:to-white group-even:to-gray-100"></div>
			</td>
			<td className="px-4 py-3">
				<button onClick={toggleComplete} className="w-full h-full flex items-center">
					<svg fill="none" stroke="currentColor" className="h-6 w-6 group/svg" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						<path strokeLinecap="round"
							className="stroke-transparent group-hover/svg:stroke-gray-300 data-[completed=true]:stroke-black data-[completed=true]:group-hover/svg:stroke-zinc-500 transition-colors"
							data-completed={order.completed} strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
					</svg>
				</button>
			</td>
		</tr>
	)
}

export const OrdersComponent = ({ allOrders }: { allOrders: OrderInterface[] }) => {
	const incompleteOrders = allOrders.filter(o => !o.completed)
	const completeOrders = allOrders.filter(o => o.completed)

	//UI
	const [selectedIndex, setSelectedIndex] = useState(0)
	const tabVariants = {
		"hide": {
			opacity: 0,
			transition: {
				duration: 0.2,
				ease: 'linear',
				when: 'beforeChildren',
			},
		},
		"show": {
			opacity: 1,
			transition: {
				duration: 0.2,
				ease: 'linear',
				when: 'beforeChildren',
			},
		},
	}
	return (
		<Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
			{/* Top Selector */}
			<Tab.List className="p-1 rounded-lg inline-flex flex-row gap-x-1 relative mb-3 focus-within:ring-4">
				{/* background */}
				<div className="w-full h-full absolute rounded-lg bg-slate-100 -z-[1] top-0 left-0"></div>
				{["Incomplete Orders", "Completed Orders", "All Orders"].map((t, i) =>
					<Tab className="p-2 rounded-md relative outline-none" key={i}>
						{/* tab content */}
						<p className="relative"> {t} </p>
						{/* background little boy */}
						{selectedIndex == i &&
							<motion.div
								className={`w-full h-full absolute top-0 left-0 rounded-md -z-[1] ${i == 0 ? "bg-yellow-300" : ""} ${i == 1 ? "bg-green-500" : ""} ${i == 2 ? "bg-white" : ""}`}
								layoutId="tabSelect"
							/>}
					</Tab>
				)}
			</Tab.List>

			{/* TABLE */}
			<div className="w-full overflow-x-auto">
				<table className="w-full overflow-hidden rounded-t-md table-fixed">
					<thead className="text-xs text-left text-gray-700 uppercase bg-gray-200">
						<tr className="[&>th]:px-4 [&>th]:py-3">
							<th className="w-64">Order ID</th>
							<th className="w-56">Date/Time of Order</th>
							<th className="min-w-[10rem]">Items</th>
							<th className="w-24">Complete</th>
						</tr>
					</thead>
					<Tab.Panels as={Fragment}>
					<AnimatePresence mode="wait">
					<Tab.Panel as={motion.tbody}
						key={`panel${selectedIndex}`} initial="hide" animate="show" exit="hide" variants={tabVariants} static
					>
						{
							[incompleteOrders, completeOrders, allOrders].map(orders =>
								orders.map(order =>
									<TableRow order={order} key={order.firebaseOrderID} />
									)
								)[selectedIndex]
						}
					</Tab.Panel>
					</AnimatePresence>
					</Tab.Panels>
				</table>
			</div>
		</Tab.Group>
	)
}