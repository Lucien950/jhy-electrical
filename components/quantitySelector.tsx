type generateNewValFunc = (oldVal: number) => number
type QuantitySelectorProps = {
	quantity: number,
	setQuantity: (generateNewVal: generateNewValFunc) => void,
	maxValue: number,
}
export const QuantitySelector = ({ quantity, setQuantity, maxValue}: QuantitySelectorProps) => {
	const canAdd = quantity + 1 <= maxValue
	const canSubtract = quantity - 1 > 0
	const subHandler = () => setQuantity(q => Math.max(q - 1, 1))
	const addHandler = () => setQuantity(q => Math.min(q + 1, maxValue))
	return (
		<div className="flex flex-row border-2">
			{/* - icon */}
			<button className="w-10 h-10 grid place-items-center disabled:text-gray-300"
				disabled={!canSubtract} onClick={subHandler}>
				<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
					<path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
				</svg>
			</button>
			{/* Quantity */}
			<span className="w-10 h-10 grid place-items-center">{quantity}</span>
			{/* + icon */}
			<button className="w-10 h-10 grid place-items-center disabled:text-gray-300"
				disabled={!canAdd} onClick={addHandler}>
				<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
			</button>
		</div>
	)
}