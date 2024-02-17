export const generateNewSKU = () =>
	Array.from({ length: 16 })
		.map(() => Math.floor(Math.random() * 64))
		.map(i => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i))
		.join("")