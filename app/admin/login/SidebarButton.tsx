import { RefObject } from "react"

export enum SidebarButtonType { Orders = "Orders", Products = "Products", Analytics = "Analytics" }

export const SidebarButton = ({ name, scrollRef }: {
	name: SidebarButtonType,
	scrollRef: RefObject<HTMLDivElement>
}) => {
	const icon = {
		[SidebarButtonType.Orders]: (<path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />),
		[SidebarButtonType.Products]: (<path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />),
		[SidebarButtonType.Analytics]: (<><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></>)
	}
	return (
		<div tabIndex={0} onClick={() => scrollRef.current?.scrollIntoView()}
			className="group px-4 py-4 mx-0 lg:w-full relative rounded-md overflow-hidden
				flex flex-row items-center gap-x-3
				hover:bg-gray-200 hover:cursor-pointer transition-colors
				outline-none focus:ring-4"
		>
			{/* <div className="h-full w-[5px] rounded-r-md bg-blue-500 absolute left-0 translate-x-[-5px] group-hover:translate-x-0 transition-transform"/> */}
			<svg className="w-8 h-8 fill-black group-hover:fill-blue-500" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        {icon[name]}
      </svg>
			<p className="hidden lg:block text-black text-xl group-hover:text-blue-500">{name}</p>
		</div>
	)
}