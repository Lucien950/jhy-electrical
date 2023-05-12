import { Tab } from '@headlessui/react';
import { Timestamp, collection, onSnapshot } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, Fragment, Dispatch, SetStateAction } from 'react';
import { FirestoreOrderInterface, OrderInterface } from 'types/order';
import { db } from 'util/firebase/firestore';

import { Listbox, Transition } from '@headlessui/react'

const timeScales = [
	{ name: 'Week' },
	{ name: 'Month' },
	{ name: 'Year' },
]
const TimeScaleSelector = ({ selected, setSelected }: { selected: { name: string; }, setSelected: Dispatch<SetStateAction<{ name: string; }>>}) => {
	return (
		<div className="w-24">
			<Listbox value={selected} onChange={setSelected}>
				<div className="relative mt-1">
					<Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
						<span className="block truncate">{selected.name}</span>
						<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
							<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
								<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
							</svg>
						</span>
					</Listbox.Button>
					<Transition
						as={Fragment}
						leave="transition ease-in duration-100"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<Listbox.Options className="absolute mt-1 max-h-60 w-32 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
							{timeScales.map((timeScale, timeScaleI) => (
								<Listbox.Option
									key={timeScaleI}
									className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900' }` }
									value={timeScale}
								>
									{({ selected }) => (
										<>
											<span
												className={`block truncate ${selected ? 'font-semibold' : 'font-normal'
													}`}
											>
												{timeScale.name}
											</span>
											{selected &&
												<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
													<svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
													</svg>
												</span>
											}
										</>
									)}
								</Listbox.Option>
							))}
						</Listbox.Options>
					</Transition>
				</div>
			</Listbox>
		</div>
	)
}

const selectedTabClasses = 'text-black'
const unSelectedTabClasses = 'text-zinc-400 hover:text-zinc-700'
const TabButton = ({selected, text}: {selected: boolean, text: string})=>{
	const getTabClasses = (selected: boolean) => selected ? selectedTabClasses : unSelectedTabClasses
	return ( <p className={`transition-colors text-xl font-semibold ${getTabClasses(selected)}`} > { text } </p> )
}

const TabPanel = ({children, className}: {children: any, className: string})=>{
	const tabAnimation = {
		"hidden": {
			opacity: 0
		},
		"show": {
			opacity: 1
		}
	}
	const tabTransition = {
		duration: 0.1,
		ease: "easeInOut"
	}
	return(
		<Tab.Panel as={motion.div} variants={tabAnimation} transition={tabTransition} initial="hidden" animate="show" exit="hidden" static className={className}>
			{children}
		</Tab.Panel>
	)
}
const GraphAnalytics = ()=>{
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [selected, setSelected] = useState(timeScales[0])
	const lookBackDates = {"Week":7, "Month":31, "Year":365}[selected.name]

	useEffect(()=>{
		//Get today's date using the JavaScript Date object.
		const pastDate = new Date();
		pastDate.setDate(pastDate.getDate() - lookBackDates!);
		const lastTimestamp = Timestamp.fromDate(pastDate)
		onSnapshot(collection(db, "orders"), (snapshot)=>{
			const graphOrders = snapshot.docs.map(d => d.data() as FirestoreOrderInterface).filter(d => d.dateTS > lastTimestamp)
		})
	}, [])
	
	return(
		<div className="pt-6 h-full bg-cyan-200 rounded-xl shadow-sm"><Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
			<Tab.List className="flex flex-row gap-x-8 px-8">
				<Tab>
					{({ selected }) => <TabButton selected={selected} text="Purchases" />}
				</Tab>
				<Tab>
					{({ selected }) => <TabButton selected={selected} text="Website Visits" />}
				</Tab>
				<Tab>
					{({ selected }) => <TabButton selected={selected} text="View 3" />}
				</Tab>
			</Tab.List>
			<Tab.Panels className="">
				<AnimatePresence mode="wait">
					{
						[
							<TabPanel key="1" className="p-4">
								<TimeScaleSelector selected={selected} setSelected={setSelected}/>
								<ul className="list-inside list-disc">
									<li></li>
								</ul>
							</TabPanel>, 
							<TabPanel key="2" className="p-4">
								<ul className="list-inside list-disc">
									<li>New Users</li>
									<li>User spent time</li>
								</ul>
							</TabPanel>, 
							<TabPanel key="3" className="p-4">
								<ul className="list-inside list-disc">
									<li></li>
								</ul>
							</TabPanel>
						][selectedIndex]
					}
				</AnimatePresence>
			</Tab.Panels>
		</Tab.Group></div>
	)
}

const NumericalAnalytics = ()=>{
	// TODO collect and display these values
	const [last48, setLast48] = useState(3)
	const [lastWeek, setLastWeek] = useState(12)
	
	const [pendingCount, setPendingCount] = useState(4)
	const hasPending = pendingCount > 0

	const [thisMonthCount, setThisMonthCount] = useState(10)
	const [lastMonthCount, setLastMonthCount] = useState(8)

	const trendUp = thisMonthCount >= lastMonthCount
	return(
		<div className="grid grid-cols-2 grid-rows-2 gap-x-2 gap-y-2">
			{/* top black strip */}
			<div className="col-span-2 bg-zinc-900 rounded-xl text-white p-6 shadow-sm">
				<h2 className="text-2xl font-semibold">At a glance</h2>
				<div className="flex flex-row w-full mt-8 mb-4">
					<div className="flex-1 flex flex-col items-center border-r-2 border-slate-600">
						<p className="text-5xl font-bold mb-3">{last48}</p>
						<p className="text-sm text-slate-500">New Orders in 48 hours</p>
					</div>
					<div className="flex-1 flex flex-col items-center">
						<p className="text-5xl font-bold mb-3">{lastWeek}</p>
						<p className="text-sm text-slate-500">Orders in Last Week</p>
					</div>
				</div>
			</div>
			{/* bottom left square */}
			<div className="bg-slate-200 rounded-2xl p-8 flex flex-col justify-between shadow-sm">
				<h2 className="text-xl font-semibold">Users this week</h2>

				<div className="flex flex-row items-end">
					<p className="text-7xl font-bold leading-none">{thisMonthCount}</p>
					<svg
						data-tu={trendUp} className="h-8 w-8 mb-[0.33rem] ml-1 data-[tu=false]:stroke-red-600 data-[tu=true]:stroke-green-400"
						fill="none" strokeWidth={3} viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
					>
						{
							trendUp
							? <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
							: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
						}
					</svg>
				</div>
			</div>
			{/* bottom right square */}
			<div data-hp={hasPending} className={`bg-green-500 data-[hp=true]:bg-yellow-500 rounded-2xl p-8 flex flex-col justify-between shadow-sm`}>
				<h2 className="text-xl font-semibold">Pending Orders</h2>
				<div className="flex flex-row items-end">
					<p className="text-7xl font-bold leading-none">{pendingCount}</p>
					<svg
						className="h-8 w-8 mb-[0.33rem] ml-1"
						fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
					>
						{
							hasPending
								? <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
								: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						}
					</svg>
				</div>
			</div>
		</div>
	)
}

const AnalyticsComponent = () => {
	return (
		<div className="flex flex-row gap-x-4 gap-y-2">
			<div className="flex-[1.25]"> <NumericalAnalytics /> </div>
			<div className="flex-[2]"> <GraphAnalytics /> </div>
		</div>
	);
}

export default AnalyticsComponent;