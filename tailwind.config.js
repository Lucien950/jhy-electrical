/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {},
		fontFamily: {
			'sans': ['IBM Plex Sans', 'ui-sans-serif', 'system-ui'],
			'serif': ['Bitter', 'ui-serif', 'Georgia'],
			'paypal': ['Jost', 'ui-sans-serif', 'system-ui']
		}
	},
	plugins: [],
}
