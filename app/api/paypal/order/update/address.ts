// api
import Joi from "joi";
import { FormPrice } from "types/price";
import { apiHandler } from "server/api";
import { updatePayPalOrderAddress } from "server/paypal";
import { addressSchema } from "types/address";
import { validateSchema } from "util/typeValidate";
import { Address } from "types/address";

export type updateOrderAddressProps = { token: string, address: Address, fullName: string }
export type updateOrderAddressRes = { newPrice: FormPrice }
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

export const PATCH = (req: Request) => apiHandler(req, updateOrderAddressHandler)