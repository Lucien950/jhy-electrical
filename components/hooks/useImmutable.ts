import { useState } from "react"

/**
 * This is a hook that can take an initial value, and whose only operation is destroying it
 * @param initialValue
 * @returns 
 */
export const useImmutable = <T,>(initialValue: T): [T | null, () => void] => {
	const [val, setVal] = useState<T | null>(initialValue)
	const removeVal = () => setVal(null)
	return [val, removeVal]
}