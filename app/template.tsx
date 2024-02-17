"use client"
import { motion } from "framer-motion";

export default function Transition({ children }: { children: React.ReactNode }) {
    const variants = { out: { opacity: 0, }, in: { opacity: 1, } }
    return (
        <motion.div
            variants={variants}
            transition={{ duration: 0.3 }}
            initial="out"
            animate="in"
            exit="out"
            id="cringe"
        >
            {children}
        </motion.div>
    )
}