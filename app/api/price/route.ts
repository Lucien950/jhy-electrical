import { fillOrderProducts } from "util/order";
import { calculatePrice } from "server/price";
import { validateSchema } from "util/typeValidate";
import { headers } from "next/headers";
import { getAddressFromIP } from "./ipaddress";
import { priceAPIProps, priceAPIPropsSchema, priceAPIRes } from ".";
import { apiHandler } from "server/api";

/**
 * @returns an ESTIMATE of the price based on the products and the IP location of the user
 */
async function priceHandler(req: Request): Promise<priceAPIRes> {
	const { productIDs } = validateSchema<priceAPIProps>(await req.json(), priceAPIPropsSchema)
	const clientIP = headers().get("x-forwarded-for")?.split(",")[0].trim() ?? headers().get("x-real-ip") ?? "::1"
	const address = await getAddressFromIP(clientIP)
	const products = await fillOrderProducts(productIDs)
	return { price: await calculatePrice(products, address) }
}

export const dynamic = 'force-dynamic'
export const POST = (req: Request) => apiHandler(req, priceHandler)