import Joi from "joi";
import { Address, addressSchema } from "types/address";
import { FormPrice } from "types/price";
import { attemptSchemaGenerator } from "util/typeValidate";

export type updateOrderAddressProps = { token: string; address: Address; fullName: string; }
export type updateOrderAddressRes = { newPrice: FormPrice; }
const updateOrderAddressPropsSchema = Joi.object({
	token: Joi.string().required(),
	address: addressSchema.required(),
	fullName: Joi.string().required().min(1).max(300)
})
export const attemptUpdateOrderAddressProps = attemptSchemaGenerator<updateOrderAddressProps>(updateOrderAddressPropsSchema)
