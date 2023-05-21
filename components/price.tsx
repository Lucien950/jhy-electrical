import { JSX, ClassAttributes, HTMLAttributes } from "react"

type spanAttributes = JSX.IntrinsicAttributes & ClassAttributes<HTMLSpanElement> & HTMLAttributes<HTMLSpanElement>
const Price = ({ price, large = false, ...rest }: { price?: number, large?: boolean } & spanAttributes) => {
	if (!price) return <p> - </p>

	const [frontPrice, rearPrice] = price.toFixed(2).split(".")
	return (
		<span {...rest}>
			<span data-large={large} className={`leading-none text-sm  data-[large=true]:text-xl  align-top relative top-[4px] pr-[1px] font-medium`}>
				$
			</span>
			<span data-large={large} className={`leading-none text-2xl data-[large=true]:text-4xl align-top pr-[2px] slashed-zero`}>
				{frontPrice}
			</span>
			<span data-large={large} className={`leading-none text-sm  data-[large=true]:text-xl  align-top relative top-[3px] slashed-zero`}>
				{rearPrice}
			</span>
		</span>
	);
}

export default Price;