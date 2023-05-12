import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { OrderInterface, FirestoreOrderInterface, productInfo } from 'types/order';
import Link from 'next/link';
import ProductInterface from 'types/product';
import { db } from 'util/firebase/firestore';
import { Tab } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";

export const OrdersComponent = () => {
	const [incompleteOrders, setIncompleteOrders] = useState<OrderInterface[]>([])
	const [completeOrders, setCompleteOrders] = useState<OrderInterface[]>([])
	const [allOrders, setAllOrders] = useState<OrderInterface[]>([])

	// update orders
	useEffect(() => {
		const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("dateTS")), (querySnapshot) => {
			const newOrders = querySnapshot.docs.map(async orderDoc => {
				const preOrder = orderDoc.data() as FirestoreOrderInterface
				return {
					...preOrder,
					dateTS: undefined,
					date: preOrder.dateTS.toDate(),
					orderID: orderDoc.id
				} as OrderInterface
			})

			Promise.all(newOrders).then(newOrders => {
				setAllOrders(newOrders)
				setIncompleteOrders(newOrders.filter(o => !o.completed))
				setCompleteOrders	(newOrders.filter(o => o.completed))
			})
		})
		return () => unsubOrders();
	}, [])


	const [selectedIndex, setSelectedIndex] = useState(0)


	const tabVariants={
		"hidden":{
			opacity: 0
		},
		"show":{
			opacity: 1
		}
	}
	return (
		<>
			<style jsx>{`
		tbody tr:nth-child(odd){
			background-color: rgb(209 213 219)
		}
		`}</style>
			<Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
				<Tab.List className="p-1 rounded-lg inline-flex flex-row gap-x-1 relative">
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
				<div className="grid grid-cols-3 font-bold">
					<div>Order ID</div>
					<div>Date/Time of Order</div>
				</div>
				<Tab.Panels>
					<AnimatePresence mode="wait">
						<Tab.Panel
							key={selectedIndex} as={motion.div}
							initial="hidden" animate="show" exit="hidden"
							variants={tabVariants}
							static
							transition={{ duration: 0.15 }}
						>
							{
								selectedIndex == 0 &&
								<div>
									{incompleteOrders.map(o=>
										<div key={`ic_${o.orderID}`}>{o.orderID} {o.date.getDate()}</div>
									)}
								</div>
							}
							{
								selectedIndex == 1 &&
								<div>
									{completeOrders.map(o=>
										<div key={`cc_${o.orderID}`}>{o.orderID} {o.date.getDate()}</div>
									)}
								</div>
							}
							{
								selectedIndex == 2 &&
								<div>
									{allOrders.map(o=>
										<div key={`all_${o.orderID}`}>{o.orderID} {o.date.getDate()}</div>
									)}
								</div>
							}
						</Tab.Panel>
					</AnimatePresence>
				</Tab.Panels>
			</Tab.Group>
		</>
	)
}