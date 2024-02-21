// api
import Joi from "joi";
import { apiHandler } from "server/api";
import { updatePayPalOrderAddress } from "server/paypal";
import { addressSchema } from "types/address";
import { validateSchema } from "util/typeValidate";
import { updateOrderAddressProps } from ".";
import { updateOrderAddressRes } from ".";

const updateOrderAddressPropsSchema = Joi.object({
	token: Joi.string().required(),
	address: addressSchema.required(),
	fullName: Joi.string().required().min(1).max(300)
})
async function updateOrderAddressHandler(req: Request) {
	const { token, address: newAddress, fullName } = validateSchema<updateOrderAddressProps>(await req.json(), updateOrderAddressPropsSchema)

	const newPrice = await updatePayPalOrderAddress(token, newAddress, fullName)
	return { newPrice } as updateOrderAddressRes
}

export const dynamic = 'force-dynamic'
export const PATCH = (req: Request) => apiHandler(req, updateOrderAddressHandler)