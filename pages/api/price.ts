import Joi from "joi";
import { NextApiHandler } from "next";
import { OrderProduct, orderProductSchema } from "types/order";
import { FinalPriceInterface } from "types/price";
import { fillOrderProducts } from "util/orderUtil";
import { apiHandler, apiRespond } from "server/api";
import { makePrice, subAddr } from "server/priceUtil";
import { validateSchema } from "util/typeValidate";
import { getClientIp } from "request-ip"

interface ipAPILocation {
	ip: string;
	network: string;
	version: string;
	city: string;
	region: string;
	region_code: string;
	country: string;
	country_name: string;
	country_code: string;
	country_code_iso3: string;
	country_capital: string;
	country_tld: string;
	continent_code: string;
	in_eu: boolean;
	postal: string;
	latitude: number;
	longitude: number;
	timezone: string;
	utc_offset: string;
	country_calling_code: string;
	currency: string;
	currency_name: string;
	languages: string;
	country_area: number;
	country_population: number;
	asn: string;
	org: string;
}

export type priceAPIProps = { productIDs: OrderProduct[] }
const priceAPIPropsSchema = Joi.object({ productIDs: Joi.array().items(orderProductSchema).required(), })
export type priceAPIRes = { price: FinalPriceInterface }

const priceAPI: NextApiHandler = async (req, res) => {
	const { productIDs } = validateSchema<priceAPIProps>(req.body, priceAPIPropsSchema)

	const clientIP = getClientIp(req)
	const fetchURL = clientIP !== "::1" ? `https://ipapi.co/${clientIP}/json` : "https://ipapi.co/198.96.61.52/json"
	// address
	const ipRes = await fetch(fetchURL)
	if (!ipRes.ok) throw await ipRes.json()
	const data: ipAPILocation = await ipRes.json()
	if (data.country_code != "CA") throw new Error("Not in Canada")
	const address: subAddr = {
		postal_code: `${data.postal}1A1`,
		admin_area_1: data.region,
	}

	const products = await fillOrderProducts(productIDs) //costs
	const price = await makePrice(products, address)
	return { price } as priceAPIRes
}

export default apiHandler({ "POST": priceAPI })