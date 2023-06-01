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
			'sans': ['var(--font-ibm-plex-sans)', 'ui-sans-serif', 'system-ui'],
			'serif': ['var(--font-bitter)', 'ui-serif', 'Georgia'],
			'paypal': ['var(--font-jost)', 'ui-sans-serif', 'system-ui']
		},
	},
	plugins: [],
}
