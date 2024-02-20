import { fillOrderProducts } from "util/order";
import { makePrice } from "server/price";
import { validateSchema } from "util/typeValidate";
import { headers } from "next/headers";
import { getAddressFromIP } from "./ipaddress";
import { priceAPIProps, priceAPIPropsSchema, priceAPIRes } from ".";
import { apiHandler } from "server/api";

async function priceHandler(req: Request): Promise<priceAPIRes> {
	const { productIDs } = validateSchema<priceAPIProps>(await req.json(), priceAPIPropsSchema)
	const clientIP = headers().get("x-forwarded-for")?.split(",")[0].trim() ?? headers().get("x-real-ip") ?? "::1"
	const address = await getAddressFromIP(clientIP)
	const products = await fillOrderProducts(productIDs)
	const price = await makePrice(products, address)
	return { price }
}

export const POST = (req: Request) => apiHandler(req, priceHandler)