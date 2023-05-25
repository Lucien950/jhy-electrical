import Head from "next/head"
import Link from "next/link"
import { JSX, SVGProps } from "react"

type SVGPROPTYPE = JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
type LinkComponentType = { href: string, title: string, desc: string, Icon: (props: SVGPROPTYPE) => JSX.Element }
const LinkComponent = ({ href, title, desc, Icon }: LinkComponentType) => (
	<>
		<Link href={href} tabIndex={-1}>
			<div className="flex flex-row px-4 py-7 gap-x-6">
				<div>
					<div className="border-[1.5px] rounded-xl p-2">
						{ <Icon className="h-6 w-6 fill-blue-500" /> }
					</div>
				</div>
				<div className="flex-1">
					<Link href={href}> <h3 className="inline text-base">{title}</h3> </Link>
					<p className="font-light text-sm">{desc}</p>
				</div>
				<div className="self-center">
					<svg fill="none" stroke="currentColor" className="h-4 w-4 stroke-slate-400" strokeWidth={3} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
					</svg>
				</div>
			</div>
		</Link>
		<hr />
	</>
)

const HomeIcon = (props: SVGPROPTYPE) => (
	<svg {...props} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
		<path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
	</svg>
)
const ProductsIcon = (props: SVGPROPTYPE) => (
	<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<path d="M12 .75a8.25 8.25 0 00-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 00.577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.714 6.714 0 01-.937-.171.75.75 0 11.374-1.453 5.261 5.261 0 002.626 0 .75.75 0 11.374 1.452 6.712 6.712 0 01-.937.172v4.66c0 .327.277.586.6.545.364-.047.722-.112 1.074-.195a.75.75 0 00.577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0012 .75z" />
		<path fillRule="evenodd" d="M9.013 19.9a.75.75 0 01.877-.597 11.319 11.319 0 004.22 0 .75.75 0 11.28 1.473 12.819 12.819 0 01-4.78 0 .75.75 0 01-.597-.876zM9.754 22.344a.75.75 0 01.824-.668 13.682 13.682 0 002.844 0 .75.75 0 11.156 1.492 15.156 15.156 0 01-3.156 0 .75.75 0 01-.668-.824z" clipRule="evenodd" />
	</svg>

)
const CartIcon = (props: SVGPROPTYPE) => (
	<svg {...props} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
	</svg>
)
const ServicesIcon = (props: SVGPROPTYPE) => (
	<svg {...props} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 007.5 9.75c.627.47 1.406.75 2.25.75.844 0 1.624-.28 2.25-.75.626.47 1.406.75 2.25.75.844 0 1.623-.28 2.25-.75a3.75 3.75 0 004.902-5.652l-1.3-1.299a1.875 1.875 0 00-1.325-.549H5.223z" />
		<path clipRule="evenodd" fillRule="evenodd" d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 009.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 002.25.506c.804 0 1.567-.182 2.25-.506 1.42.674 3.08.675 4.5.001v8.755h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3zm3-6a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v3a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-3zm8.25-.75a.75.75 0 00-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-5.25a.75.75 0 00-.75-.75h-3z" />
	</svg>
)

export default function ErrorPage() {
	return (
		<>
			<Head>
				<title>404 - Page Not Found</title>
			</Head>
			<div className="h-screen w-screen grid place-items-center">
				<div>
					<div className="text-center mb-14">
						<p className="mb-4 font-semibold text-blue-400">404</p>
						<h1 className="text-5xl font-bold mb-6">This page does not exist</h1>
						<h2 className="text-lg text-zinc-500">Sorry, we couldn't find the page you're looking for.</h2>
					</div>
					<div>
						<LinkComponent href="/" title="Home" desc="Navigate to the home page" Icon={HomeIcon} />
						<LinkComponent href="/products" title="Products" desc="Shop our lighting products" Icon={ProductsIcon} />
						<LinkComponent href="/services" title="Services" desc="Discover the services that JHY can provide for you" Icon={ServicesIcon} />
						<LinkComponent href="/cart" title="Cart" desc="Complete your order by checking your cart" Icon={CartIcon} />
					</div>
				</div>
			</div>
		</>
	)
}