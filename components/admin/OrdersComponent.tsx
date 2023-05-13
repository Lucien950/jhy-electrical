// react
import { useEffect, useState } from "react"
import Link from "next/link"
// firebase
import { OrderInterface } from 'types/order'
// UI
import { AnimatePresence, motion } from "framer-motion"
import { Tab } from "@headlessui/react"


export const OrdersComponent = ({allOrders}: {allOrders: OrderInterface[]}) => {
	const incompleteOrders = allOrders.filter(o => !o.completed)
	const completeOrders = allOrders.filter(o => o.completed)

	//UI
	const [selectedIndex, setSelectedIndex] = useState(0)
	const tabVariants={ "hidden":{ opacity: 0 }, "show":{ opacity: 1 } }
	return (
		<Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
			{/* Top Selector */}
			<Tab.List className="p-1 rounded-lg inline-flex flex-row gap-x-1 relative mb-3">
				<div className="w-full h-full absolute rounded-lg bg-slate-100 -z-[1] top-0 left-0"></div>
				{["Incomplete Orders", "Completed Orders", "All Orders"].map((t, i)=>
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
			<table className="w-full overflow-hidden rounded-t-md table-fixed	">
				<thead className="text-xs text-left text-gray-700 uppercase bg-gray-200">
					<tr>
						<th className="px-4 py-3 w-64">Order ID</th>
						<th className="px-4 py-3 w-64">Date/Time of Order</th>
						<th className="px-4 py-3">Items</th>
						<th className="px-4 py-3 w-48">Mark as Complete</th>
					</tr>
				</thead>
				<AnimatePresence mode="wait">
				<Tab.Panel
					key={selectedIndex} as={motion.tbody}
					initial="hidden" animate="show" exit="hidden"
					variants={tabVariants}
					static
					transition={{ duration: 0.15 }}
				>
					{[incompleteOrders, completeOrders, allOrders][selectedIndex].map(order=>
						<tr key={order.orderID} className="odd:bg-white even:bg-gray-100 border-b border-x group">
							<td className="px-4 py-3">
								<Link href={`/order/${order.orderID}`} target="_blank" className="underline text-blue-500 visited:text-purple-500">
									{order.orderID}
								</Link>
							</td>
							<td className="px-4 py-3">{order.date.toLocaleDateString()} {order.date.toLocaleTimeString()}</td>
							<td className="px-4 py-3 overflow-hidden relative">
								<p className="whitespace-nowrap">
									{
										order.products.map(productInfo => `${productInfo.product!.productName} x ${productInfo.quantity}`).join(", ")
									}
								</p>
								<div className="absolute h-full w-24 right-0 top-0 bg-gradient-to-r from-transparent group-odd:to-white group-even:to-gray-100"></div>
							</td>
							<td></td>
						</tr>
					)}
				</Tab.Panel>
				</AnimatePresence>
			</table>
		</Tab.Group>
	)
}