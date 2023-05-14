const Price = ({ price, large = false, ...rest }: { price?: number, large?: boolean, className?: string}) => {
	if (!price) return <p> - </p>

	const [frontPrice, rearPrice] = price.toFixed(2).split(".")
	return (
		<span {...rest}>
			<span className={`leading-none ${large ? "text-xl" : "text-sm"} align-top relative top-[4px] pr-[1px] font-medium`}>
				$
			</span>
			<span className={`leading-none ${large ? "text-4xl" : "text-2xl"} align-top pr-[2px] slashed-zero`}>
				{frontPrice}
			</span>
			<span className={`leading-none ${large ? "text-xl" : "text-sm"} align-top relative top-[3px] slashed-zero`}>
				{rearPrice}
			</span>
		</span>
	);
}

export default Price;