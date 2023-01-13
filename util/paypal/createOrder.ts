const createOrder = async (amount: number)=>{
	const response = await fetch(`/api/paypal/createorder?amount=${amount.toFixed(2)}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	})

	console.log(response)
	const body = await response.json()
	const { redirect_link, orderStatus }: { redirect_link: string | undefined, orderStatus: string } = body
	if (orderStatus == "COMPLETED")
		throw "REQUEST ID HAS BEEN USED"
	if (!redirect_link)
		throw "Redirect Link could not be found"

	return redirect_link
}

export { createOrder }