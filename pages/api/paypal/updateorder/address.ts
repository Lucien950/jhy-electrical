// api
import Joi from "joi";
import { Address } from "@paypal/paypal-js"
import { PriceInterface } from "types/price";
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler, apiRespond } from "server/api";
import { updateOrderAddress } from "server/paypal/updateOrderFetch";
import { addressSchema } from "types/address";
import { validateSchema } from "util/typeValidate";

export type updateOrderAddressProps = { token: string, address: Address, fullName: string }
export type updateOrderAddressRes = { newPrice: PriceInterface }
const updateOrderAddressPropsSchema = Joi.object({
	token: Joi.string().required(),
	address: addressSchema.required(),
	fullName: Joi.string().required().min(1).max(300)
})
async function UpdateOrderAddressAPI (req: NextApiRequest, res: NextApiResponse) {
	const { token, address: newAddress, fullName } = validateSchema<updateOrderAddressProps>(req.body, updateOrderAddressPropsSchema)

	const newPrice = await updateOrderAddress(token, newAddress, fullName)
	return apiRespond<updateOrderAddressRes>(res, "response", { newPrice })
}

export default apiHandler({
	"PATCH": UpdateOrderAddressAPI
})