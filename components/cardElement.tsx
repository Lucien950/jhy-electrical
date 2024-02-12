import { JSX, MouseEventHandler, SVGProps, useEffect, useRef, useState } from "react";
import seedRandom from "seedrandom";
import { PaymentSource } from "types/paypal";

const CardSVG = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		data-name="Layer 1"
		viewBox="0 0 140.69 83.72"
		{...props}
	>
		<defs>
			<linearGradient
				id="a"
				x1={28.38}
				x2={15.72}
				y1={10.46}
				y2={21.06}
				gradientUnits="userSpaceOnUse"
			>
				<stop offset={0} stopColor="#f0e89f" />
				<stop offset={1} stopColor="#d99d3d" />
			</linearGradient>
		</defs>
		<g data-name="Card Back">
			<path
				d="M135.31 0h-9.25l-13.73 83.72h23a5.38 5.38 0 0 0 5.38-5.38v-73a5.38 5.38 0 0 0-5.4-5.34Z"
				style={{
					opacity: 0.81,
				}}
			/>
			<path
				d="M10.88 0h-5.5A5.38 5.38 0 0 0 0 5.38v73a5.38 5.38 0 0 0 5.38 5.38h52.74L77.58 55 114.72.09Z"
				style={{
					opacity: 0.86,
				}}
			/>
			<path
				d="M114.72.09 77.58 55.01 58.12 83.72h54.21L126.06.04l-11.34.05z"
				style={{
					opacity: 0.76,
				}}
			/>
			<path
				d="M77.58 55 10.88 0h-5.5A5.38 5.38 0 0 0 0 5.38v73a5.38 5.38 0 0 0 5.38 5.38h107Z"
				style={{
					opacity: 0.36,
				}}
			/>
		</g>
		<path
			d="M19.19 21.39h-2.53a1.33 1.33 0 0 1-1-.45c-.44-.43-.29-1.06-.33-1.61 0-.08 0-.11.11-.11h2.79a.5.5 0 0 0 .36-.14c.45-.4.92-.76 1.36-1.17a.26.26 0 0 1 .21-.08h1.58c.08 0 .11 0 .11.1v3.34c0 .09 0 .11-.1.11Zm0-11.17h-2.43a1.43 1.43 0 0 0-1.22.61c-.3.42-.16 1-.19 1.46 0 .07 0 .1.09.1h2.91c.22 0 .36.26.53.38l.54.47c.24.16.52.56.81.55h1.45c.17 0 .17 0 .18-.18v-3.25c0-.12 0-.12-.12-.12Zm8.06 11.17a1.39 1.39 0 0 0 1-.39c.5-.42.37-1.09.39-1.68 0-.08 0-.1-.09-.1h-2.88c-.19 0-.31-.21-.46-.31-.35-.31-.71-.59-1.06-.89a.61.61 0 0 0-.44-.19h-1.38c-.18 0-.15.05-.15.19v3.22c0 .14 0 .14.14.14h4.93Zm-2.38-11.17h-2.56c-.07 0-.12 0-.12.11v3.31c0 .13 0 .13.13.13h1.45a.44.44 0 0 0 .34-.14c.31-.27.64-.53 1-.8s.39-.43.65-.46h2.82c.09 0 .11 0 .11-.11a3.71 3.71 0 0 0-.15-1.26 1.38 1.38 0 0 0-1.23-.79h-2.44ZM22 14.11h-1.74c-.07 0-.09 0-.09.09v3.22c0 .07 0 .09.09.09h3.44c.13 0 .14 0 .14-.14v-3.15c0-.08 0-.1-.1-.1ZM17.6 16h-2.1c-.18 0-.15 0-.15.14v2.67c0 .09 0 .11.11.11h2.77c.2 0 .45-.32.62-.43.3-.26.6-.53.9-.78a.25.25 0 0 0 .09-.19v-1.4c0-.12 0-.12-.11-.12Zm0-.33h2.18c.05 0 .09 0 .09-.09V14.1c0-.18-.31-.3-.43-.43-.31-.27-.6-.54-.91-.79-.07-.06-.13-.14-.24-.14h-2.86c-.06 0-.08 0-.08.08v2.74c0 .09 0 .11.11.11Zm8.84.33h-2.15c-.12 0-.12 0-.12.12v1.4c0 .2.3.31.43.45l.93.79a.52.52 0 0 0 .36.16h2.71s.06 0 .06-.06v-2.77c0-.11 0-.12-.13-.11h-2.12Zm0-.34h2.15c.07 0 .09 0 .09-.09v-2.71c0-.08 0-.11-.11-.1h-2.78c-.11 0-.17.09-.25.16q-.48.38-.93.78c-.11.12-.41.27-.44.42v1.47c0 .07 0 .08.09.08Z"
			style={{
				fill: "url(#a)",
			}}
		/>
	</svg>
)

export const CardElement = ({ cardInformation, seed="", dead=false }: { cardInformation: PaymentSource["card"], seed?: string, dead?:boolean }) => {
	const [chosenColour, setChosenColour] = useState<string>()

	const cardColorID = Math.round(seedRandom(seed)() * 3) + 1
	const cardColours = ["fill-red-600", "fill-black", "fill-blue-700"]
	useEffect(() => { setChosenColour(cardColours[cardColorID]) }, []) // eslint-disable-line react-hooks/exhaustive-deps

	const boxRef = useRef<HTMLDivElement>(null);
	const handleMouseMove: MouseEventHandler<HTMLDivElement> = e => {
		if (!boxRef.current) return
		const [x, y] = [e.nativeEvent.offsetX, e.nativeEvent.offsetY]
		const [mostX, mostY] = [3, 3];
		const { width, height } = boxRef.current.getBoundingClientRect();
		const halfWidth = width / 2;
		const halfHeight = height / 2;
		// calculate angle
		const rotationX = ((x - halfWidth) / halfWidth) * mostX
		const rotationY = (-(y - halfHeight) / halfHeight) * mostY

		boxRef.current.style.transform = `perspective(1000px) rotateX(${rotationY}deg) rotateY(${rotationX}deg) scale3d(1, 1, 1)`
		boxRef.current.style.transition = "none"
	}
	const clearRotation = () => {
		if(!boxRef.current) return
		boxRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
		boxRef.current.style.transition = "transform 100ms ease"
	}

	const CardDead = ()=>(
		<div className="relative inline-block pointer-events-none" ref={boxRef}>
			<CardSVG className={`w-80 ${chosenColour}`} />
			<div className="text-white fill-white flex flex-row items-end justify-between absolute inset-0 px-4 py-4 select-none">
				{/* digits and dots */}
				<div>
					{cardInformation?.expiry && <p className="font-semibold mb-1 text-sm">{`Exp ${cardInformation.expiry}`}</p> }
					<div className="flex flex-row items-center gap-x-3">
						<div className="flex flex-row gap-x-[4px]">
							<svg className="h-2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" /></svg>
							<svg className="h-2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" /></svg>
							<svg className="h-2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" /></svg>
							<svg className="h-2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" /></svg>
						</div>
						<p className="text-2xl font-bold leading-none">
							{cardInformation?.last_digits}
						</p>
					</div>
				</div>
				{/* name and type */}
				<div className="flex flex-col items-end justify-between h-full">
					<p className="font-semibold text-lg leading-none">{cardInformation?.type}</p>
					<p className="font-bold text-2xl leading-none">{cardInformation?.brand}</p>
				</div>
			</div>
		</div>
	)

	if(dead) return <CardDead />
	return <div onMouseMove={handleMouseMove} onMouseLeave={clearRotation} className="inline-block relative" > <CardDead /> </div>
}
