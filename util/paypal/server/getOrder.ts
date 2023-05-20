import { generateAccessToken } from 'util/paypal/server/auth'
import { CustomerInterface } from 'types/customer';
import { PriceInterface } from "types/price";
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
export const getOrder = async (orderID: string) => {
	const accessToken = await generateAccessToken()
	const response = await fetch(`https://api.sandbox.paypal.com/v2/checkout/orders/${orderID}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	})
	if (response.ok) {
		const data = await response.json() as OrderResponseBody

		// shipping
		const purchaseUnit0 = data.purchase_units![0]
		const shipping = purchaseUnit0.shipping
		// CUSTOMER INFORMATION
		const customerInfo = {
			fullName: shipping?.name?.full_name || null,
			address: shipping?.address || null,
		} as CustomerInterface
		// little validation
		if (shipping?.address?.country_code && shipping.address.country_code != "CA") throw new Error("Do not ship outside Canada")

		// customerInfo.
		if (["APPROVED", "COMPLETED"].includes(data.status)) { //TODO decide if completed should throw error, since it is not useful anymore?
			//eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			customerInfo.paymentMethod = Object.keys(data.payment_source!)[0] as "card" | "paypal" 
			//eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			customerInfo.payment_source = data.payment_source!
		}

		// PAYMENT INFORMATION
		const amount = purchaseUnit0.amount
		const breakdown = amount.breakdown! //eslint-disable-line @typescript-eslint/no-non-null-assertion
		// idk why those are even possibly null
		const priceInfo = {
			subtotal: Number(breakdown.item_total!.value), 	//eslint-disable-line @typescript-eslint/no-non-null-assertion
			tax: Number(breakdown.tax_total!.value),				//eslint-disable-line @typescript-eslint/no-non-null-assertion
			shipping: Number((breakdown.shipping?.value) || 0),
			total: Number(amount.value)
		} as PriceInterface

		// products
		const products = purchaseUnit0.items!.map(i => ({
			PID: i.name,
			quantity: Number(i.quantity)
		} as OrderProduct))

		// redirect link
		const redirect_link = data.links.find(v => v.rel == "approve")?.href || null

		const status = data.status

		return { customerInfo, priceInfo, products, redirect_link, status }
	}
	else throw await response.json()
}