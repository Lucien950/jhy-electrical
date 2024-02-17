// api
import Joi from "joi";
import { PriceInterface } from "types/price";
import { apiHandler } from "server/api";
import { updateOrderAddress } from "server/paypal/updateOrderFetch";
import { addressSchema } from "types/address";
import { validateSchema } from "util/typeValidate";
import { Address } from "types/address";

export type updateOrderAddressProps = { token: string, address: Address, fullName: string }
export type updateOrderAddressRes = { newPrice: PriceInterface }
const updateOrderAddressPropsSchema = Joi.object({
	token: Joi.string().required(),
	address: addressSchema.required(),
	fullName: Joi.string().required().min(1).max(300)
})
async function updateOrderAddressHandler(req: Request) {
	const { token, address: newAddress, fullName } = validateSchema<updateOrderAddressProps>(req.body, updateOrderAddressPropsSchema)

	const newPrice = await updateOrderAddress(token, newAddress, fullName)
	return { newPrice } as updateOrderAddressRes
}

export const PATCH = (req: Request) => apiHandler(req, updateOrderAddressHandler)