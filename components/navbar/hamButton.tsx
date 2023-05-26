import { motion } from "framer-motion";

type HamButtonProps = { isOpen: boolean, className?: string, onClick: () => void, id: string }
export const HamButton = ({ isOpen, className, onClick, id }: HamButtonProps) => {
	// animations
	const variant = isOpen ? "opened" : "closed";
	const transition = { type: "spring", duration: 0.35 };
	const centerTransition = { ease: "easeOut", duration: transition.duration / 1.5 }
	const top = {
		closed: { rotate: 0, translateY: 0, transition: { delay: 0 } },
		opened: { rotate: 45, translateY: 6, transition: { delay: 0.1 } }
	};
	const center = {
		closed: { x: 0, opacity: 1, transition: { delay: 0.1 } },
		opened: { x: "100%", opacity: 0, transition: { delay: 0 } }
	};
	const bottom = {
		closed: { rotate: 0, translateY: 0, transition: { delay: 0 } },
		opened: { rotate: -45, translateY: -6, transition: { delay: 0.1 } }
	};

	// line properties
	const strokeWidth = 3;
	const lineProps = {
		strokeWidth: strokeWidth as number,
		initial: "closed",
		animate: variant,
	};

	return (
		<motion.svg
			className={`w-12 h-12 ${className}`}
			fill="none" stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			onClick={onClick}
			id={id}
		>
			<motion.path
				variants={top}
				d="M4 6h16"
				{...lineProps}
				transition={transition}
				style={{ originX: '12px', originY: '6px' }}
			/>
			<motion.path
				variants={center}
				d="M4 12h16"
				{...lineProps}
				transition={centerTransition}
				style={{ originX: '12px', originY: '12px' }}
			/>
			<motion.path
				variants={bottom}
				d="M4 18h16"
				{...lineProps}
				transition={transition}
				style={{ originX: '12px', originY: '18px' }}
			/>
		</motion.svg>
	)
}