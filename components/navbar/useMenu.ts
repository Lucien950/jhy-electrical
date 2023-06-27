import { useEffect, useState } from "react"

export const useMenu = (menuIds: string[]): [boolean, (() => void), (() => void)] => {
	const [menuOpen, setMenuOpen] = useState(false)

	// add event listener because event can give information about where the mouse was
	// grouping with toggle only fires when button is clicked (rather than random elements)
	const clickAwayHandler = (e: MouseEvent) => {
		const menuElements = menuIds.map(s => document.getElementById(s))
		const clickingMenuElements = menuElements.some(el => el && el.contains(e.target as HTMLElement))
		if (!clickingMenuElements) setMenuOpen(false)
	}
	useEffect(() => {
		window.addEventListener("click", clickAwayHandler)
		return () => { window.removeEventListener("click", clickAwayHandler) }
	}, []) //eslint-disable-line react-hooks/exhaustive-deps

	const toggleMenuOpen = () => setMenuOpen(e => !e)
	return [menuOpen, toggleMenuOpen, () => setMenuOpen(false)]
}