import { submitOrderProps, submitOrderReturn } from "pages/api/paypal/submitorder"

export const submitOrder = async (orderID: string) => {
	const response = await fetch("/api/paypal/submitorder", {
		method: "POST",
		body: JSON.stringify({ token: orderID } as submitOrderProps)
	})
	const {res, err} = await response.json() as submitOrderReturn
	if(response.ok){
		return res!
	}
	else{
		console.error(err!)
		throw new Error(err!.error_message)
	}
}