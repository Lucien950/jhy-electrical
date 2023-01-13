import { productInfo } from "types/order"

const calculateShipping = async (cart: productInfo[], postalCode: string)=>{
	const body = JSON.stringify({
		products: cart.map(productInfo => {
			const { width, height, length, weight } = productInfo.product!
			return { width, height, length, weight, id: productInfo.PID }
		}),
		destination: postalCode
	})
	const res = await fetch("/api/shippingcost", {
		method: "POST",
		body
	})

	const data = await res!.json()
	if (!res.ok) throw data
	return data as {[productID: string]: number}
}

export { calculateShipping }