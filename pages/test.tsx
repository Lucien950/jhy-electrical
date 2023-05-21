import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function test(){
	const [isOpen, setIsOpen] = useState(false)
	const onClose = ()=>setIsOpen(o=>!o)
	const modalVariants = {
		open: {
			translateY: 0
		},
		closed: {
			translateY: -60
		}
	};
	return (
		<>
			<div className="grid place-items-center h-screen w-full">
				<button onClick={onClose}>Open</button>
			</div>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						key="backdrop"
						className="fixed inset-0 bg-black bg-opacity-50 grid place-items-center"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<motion.div
							key="modal"
							className="bg-white p-10"
							initial="closed"
							animate="open"
							exit="closed"
							variants={modalVariants}
						>
							<button onClick={onClose}>Close</button>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}