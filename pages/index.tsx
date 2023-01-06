import Head from "next/head"
import { Parallax } from "react-scroll-parallax"
export default function Home() {
return (
	<>
	<Head>
		<title>Home | JHY Electrical</title>
	</Head>
	<div className="h-[127vh]">
		<div className="h-[49rem] bg-slate-800 relative grid place-items-center -z-[-2]">
			<Parallax speed={35} className="absolute top-[-2rem]">
				<img src="/light.png" className="h-[43rem] pointer-events-none select-none" alt="Hanging Light" />
			</Parallax>
			<div className="absolute bottom-[9rem] md:bottom-[8.5rem] -z-[1] text-[3rem] md:text-[7rem] font-black text-white">
				JHY ELECTRICAL
			</div>
		</div>
	</div>
	</>
)}
