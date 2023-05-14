import { generateAccessToken } from 'util/paypal/auth'
import CustomerInterface from 'types/customer';
import { PaypalOrder } from 'types/paypalTypes';

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

export default async (orderID: string)=>{
	const accessToken = await generateAccessToken()
	const response = await fetch(`https://api.sandbox.paypal.com/v2/checkout/orders/${orderID}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	})

	if(response.ok){
		const data = await response.json() as PaypalOrder
		if (data.name =="RESOURCE_NOT_FOUND") throw { error_message: "PayPal could not find order"}
		const payer = data.payer
		const purchaseUnit0 = data.purchase_units![0]
		if (purchaseUnit0.shipping.address.country_code != "CA") throw { error_message: "Do not ship outside Canada" }
		return {
			first_name: payer.name.given_name,
			last_name: payer.name.surname,
			address: purchaseUnit0.shipping.address,
			paymentMethod: "paypal",
			paypalInfo: {
				paypalEmail: data.payer.email_address,
				token: orderID
			}
		} as CustomerInterface
	}
	else{
		throw {error_message: "Fetch Error"}
	}
}