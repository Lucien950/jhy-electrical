// api
import Joi from "joi";
import { Address } from "@paypal/paypal-js"
import { PriceInterface } from "types/price";
import { NextApiRequest, NextApiResponse } from "next";
import { apiRespond } from "util/paypal/server/api";
import { updateOrderAddress } from "util/paypal/server/updateOrderFetch";
import { addressSchema } from "types/paypal";

export type updateOrderAddressProps = { token: string, address: Address, fullName: string }
export type updateOrderAddressRes = { newPrice: PriceInterface }
const updateOrderAddressPropsError = (c: any) => Joi.object({
	token: Joi.string().required(),
	address: addressSchema.required(),
	fullName: Joi.string().required().min(1).max(300)
}).validate(c).error
const validateUpdateOrderAddressProps = (c: any): c is updateOrderAddressProps => updateOrderAddressPropsError(c) === undefined

export default async function (req: NextApiRequest, res: NextApiResponse) {
	if (!validateUpdateOrderAddressProps(req.body)) return apiRespond(res, "error", updateOrderAddressPropsError(req.body))
	const { token, address: newAddress, fullName } = req.body

	try {
		const newPrice = await updateOrderAddress(token, newAddress, fullName)
		return apiRespond<updateOrderAddressRes>(res, "response", { newPrice })
	}
	catch (e) {
		return apiRespond(res, "error", e)
	}
}