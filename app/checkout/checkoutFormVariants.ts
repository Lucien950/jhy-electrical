import { Variants } from "framer-motion";

export const displayVariants: Variants = {
	visible: {
		opacity: 1,
		transition:{
			duration: 0.25
		}
	},
	hidden: {
		opacity: 0,
		transition: {
			duration: 0.25
		}
	}
}
