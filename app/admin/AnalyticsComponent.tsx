import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Order } from 'types/order';

const AnalyticsComponent = ({ allOrders }: { allOrders: Order[] }) => {
	const [last48OrderCount, setLast48OrderCount] = useState<number>()
	const [lastWeekOrderCount, setLastWeekOrderCount] = useState<number>()

	const [pendingOrderCount, setPendingOrderCount] = useState<number>()
	const hasPending = (pendingOrderCount || 0) > 0

	useEffect(() => {
		const pastDate = new Date();
		pastDate.setDate(pastDate.getDate() - 2);
		setLast48OrderCount(allOrders.filter(o => (o.date > pastDate)).length)

		pastDate.setDate(pastDate.getDate() - 7);
		setLastWeekOrderCount(allOrders.filter(o => (o.date > pastDate)).length)

		setPendingOrderCount(allOrders.filter(o => !o.completed).length)
	}, [allOrders])

	const opacityVariants = { hide: { opacity: 0 }, show: { opacity: 1 } }
	return (
		<div className="flex items-start flex-col md:flex-row [&>*]:h-52 gap-x-4 gap-y-4">
			{/* top black strip */}
			<div className="bg-zinc-900 rounded-xl text-white p-5 shadow-sm flex flex-col aspect-[16/9]">
				<h2 className="text-2xl font-semibold">At a glance</h2>
				<div className="flex flex-row w-full mt-8 mb-4">
					<div className="flex-1 flex flex-col items-center border-r-2 border-slate-600">
						<AnimatePresence mode="wait">
							{
								(last48OrderCount !== undefined) &&
								<motion.p className="text-5xl font-bold mb-3" key={`48hours${last48OrderCount}`} variants={opacityVariants} initial="hide" animate="show" exit="hide">
									{last48OrderCount}
								</motion.p>
							}
						</AnimatePresence>
						<p className="text-sm text-slate-500">New Orders in 48 hours</p>
					</div>
					<div className="flex-1 flex flex-col items-center">
						<AnimatePresence mode="wait">
							{
								(lastWeekOrderCount !== undefined) &&
								<motion.p className="text-5xl font-bold mb-3" key={`lastweek${lastWeekOrderCount}`} variants={opacityVariants} initial="hide" animate="show" exit="hide">
									{lastWeekOrderCount}
								</motion.p>
							}
						</AnimatePresence>
						<p className="text-sm text-slate-500">Orders in Last Week</p>
					</div>
				</div>
			</div>
			{/* bottom right square */}
			<div data-hp={hasPending} className={`bg-green-500 data-[hp=true]:bg-yellow-500 transition-colors rounded-2xl p-5 pb-6 flex flex-col justify-between shadow-sm aspect-square`}>
				<h2 className="text-xl font-semibold">Pending Orders</h2>
				<div className="flex flex-row items-end">
					<AnimatePresence mode="wait" initial={false}>
						{
							(pendingOrderCount !== undefined) &&
							<motion.p className="text-8xl font-bold leading-none"
								initial="hide" animate="show" exit="hide" variants={opacityVariants} key={`pendingOrderCount${pendingOrderCount}`}
							>
								{pendingOrderCount}
							</motion.p>
						}
					</AnimatePresence>
					<svg
						className="h-8 w-8 mb-[0.33rem] ml-2"
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

export default AnalyticsComponent;