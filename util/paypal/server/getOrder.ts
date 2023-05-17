import { generateAccessToken } from 'util/paypal/server/auth'
import CustomerInterface from 'types/customer';
import { PriceInterface } from 'util/priceUtil';
import { OrderResponseBody } from "@paypal/paypal-js"
import { OrderProduct } from 'types/order';

const provinceConvert = {
	"AB": "Alberta",
	"BC": "British Columbia",
	"MB": "Manitoba",
	"NB": "New Brunswick",
	"NL": "Newfoundland and Labrador",
	"NT": "Northwest Territories",
	"NS": "Nova Scotia",
	"NU": "Nunavut",
	"ON": "Ontario",
	"PE": "Prince Edward Island",
	"QC": "Quebec",
	"SK": "Saskatchewan",
	"YT": "Yukon",
} as { [key: string]: string }

/**
 * Gets order of given orderID. THIS IS A SERVER SIDE FUNCTION.
 * @param orderID ID of the order we are interested in
 * @returns Order we are interested in
 */
export const getOrder = async (orderID: string)=>{
	const accessToken = await generateAccessToken()
	const response = await fetch(`https://api.sandbox.paypal.com/v2/checkout/orders/${orderID}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	})
	const reJSON = await response.json()
	if(response.ok){
		const data = reJSON as OrderResponseBody

		// CUSTOMER INFORMATION
		let customerInformation = {} as CustomerInterface
		// shipping
		const purchaseUnit0 = data.purchase_units![0]
		const shipping = purchaseUnit0.shipping
		if (shipping?.address?.country_code && shipping.address.country_code != "CA") throw new Error("Do not ship outside Canada")
		if (shipping?.name?.full_name !== undefined) customerInformation.fullName = shipping?.name?.full_name
		if (shipping?.address !== undefined) customerInformation.address = shipping?.address

		// payer
		if (["APPROVED", "COMPLETED"].includes(data.status)){
			customerInformation.payment_source = data.payment_source!
			customerInformation.paymentMethod = Object.keys(customerInformation.payment_source)[0] as "card" | "paypal"
		}

		// PAYMENT INFORMATION
		const amount = purchaseUnit0.amount
		const breakdown = amount.breakdown
		const paymentInformation = {
			subtotal: Number((breakdown?.item_total?.value) || 0),
			tax: Number((breakdown?.tax_total?.value) || 0),
			shipping: Number((breakdown?.shipping?.value) || 0),
			total: Number(amount.value)
		} as PriceInterface

		// products
		const products = purchaseUnit0.items!.map(i=>({
			PID: i.name,
			quantity: Number(i.quantity)
		} as OrderProduct))

		// redirect link
		const redirect_link = data.links.find(v => v.rel == "approve")?.href

		const status = data.status

		return { customerInformation, paymentInformation, products, redirect_link, status }
	}
	else throw reJSON
}