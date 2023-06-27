import { generateAccessToken } from 'server/paypal/auth'
import { CustomerInterface } from 'types/customer';
import { FinalPriceInterface, PriceInterface } from "types/price";
import { OrderResponseBody } from "@paypal/paypal-js"
import { OrderProduct } from 'types/order';
import { PayPalError } from 'types/paypal';
import { PAYPALDOMAIN } from 'server/paypal/domain';
import { decodePayPalSKU } from './sku';

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
	const response = await fetch(`${PAYPALDOMAIN}/v2/checkout/orders/${orderID}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	})
	if (!response.ok) throw await response.json() as PayPalError

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
	if (["APPROVED", "COMPLETED"].includes(data.status)) {
		//eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		customerInfo.paymentMethod = Object.keys(data.payment_source!)[0] as "card" | "paypal"
		//eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		customerInfo.payment_source = data.payment_source!
	}

	// PAYMENT INFORMATION
	const amount = purchaseUnit0.amount
	const breakdown = amount.breakdown! //eslint-disable-line @typescript-eslint/no-non-null-assertion
	const taxTotal = breakdown.tax_total?.value
	const shippingTotal = breakdown.shipping?.value
	const finalcalculated = !!taxTotal && !!shippingTotal
	const priceInfo = finalcalculated ? {
		subtotal: Number(breakdown.item_total!.value), 	//eslint-disable-line @typescript-eslint/no-non-null-assertion
		tax: Number(taxTotal),
		shipping: Number(shippingTotal),
		total: Number(amount.value)
	} as FinalPriceInterface
		:
		{
			subtotal: Number(breakdown.item_total!.value), 	//eslint-disable-line @typescript-eslint/no-non-null-assertion
			total: Number(amount.value)
		} as PriceInterface

	// products
	const products: OrderProduct[] = purchaseUnit0.items!.map(i => {
		const { productID, variantID } = decodePayPalSKU(i.sku!)
		return {
			PID: productID,
			quantity: Number(i.quantity),
			variantSKU: variantID,
		}
	})

	// redirect link
	const redirect_link = data.links.find(v => v.rel == "approve")?.href || null

	const status = data.status

	return { customerInfo, priceInfo, products, redirect_link, status }
}