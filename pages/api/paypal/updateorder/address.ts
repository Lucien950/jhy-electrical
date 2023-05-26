// api
import Joi from "joi";
import { Address } from "@paypal/paypal-js"
import { PriceInterface } from "types/price";
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler, apiRespond } from "util/paypal/server/api";
import { updateOrderAddress } from "util/paypal/server/updateOrderFetch";
import { addressSchema } from "types/paypal";
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

	// TODO check address is valid?
	const newPrice = await updateOrderAddress(token, newAddress, fullName)
	return apiRespond<updateOrderAddressRes>(res, "response", { newPrice })
}

export default apiHandler({
	"PATCH": UpdateOrderAddressAPI
})