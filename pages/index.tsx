import Head from "next/head"
export default function Home() {
return (
	<>
	<Head>
		<title>Home | JHY Electrical</title>
	</Head>
	<div className="h-[127vh]">
		<div className="max-h-screen h-[49rem] bg-slate-800 relative z-[2]">
			{/* <div className="absolute left-[50%] translate-x-[-50%] top-[-2rem]">
				<Parallax speed={35} className="border-2">
					<img src="/light.png" className="w-[30rem] pointer-events-none select-none" alt="Hanging Light" />
				</Parallax>
			</div> */}
			<div className="absolute left-[50%] translate-x-[-50%] whitespace-nowrap bottom-[9rem] md:bottom-[8.5rem] -z-[1] text-[2.7rem] md:text-[7rem] font-black text-white text-center">
				JHY ELECTRICAL
			</div>
		</div>
	</div>
	</>
)}
