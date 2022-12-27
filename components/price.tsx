const Price = ({price}: {price:number}) => {
	return (
		<span>
			<span className="leading-none text-sm align-top relative top-[4px] pr-[1px] font-medium">$</span>
			<span className="leading-none text-2xl align-top pr-[2px] slashed-zero">{price.toFixed(2).split(".")[0]}</span>
			<span className="leading-none text-sm align-top relative top-[3px] slashed-zero">{price.toFixed(2).split(".")[1]}</span>
		</span>
	);
}

export default Price;