// api
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler, apiRespond } from "server/api";
import { PaymentSource } from "types/paypal";
import { Card, cardSchema } from "types/card";
import Joi from "joi";
import { validateSchema } from "util/typeValidate";
import { approveCardFetch } from "server/paypal/approveOrderFetch";

export type approveCardProps = { token: string, card: Card }
const approveCardPropsSchema = Joi.object({ token: Joi.string().required(), card: cardSchema.required() })
export type approveCardRes = {newPaymentSource: PaymentSource}

async function approveCardAPI(req: NextApiRequest, res: NextApiResponse){
	const { token, card } = validateSchema<approveCardProps>(req.body, approveCardPropsSchema)
	const order = await approveCardFetch(token, card)
	if(!order.payment_source) return apiRespond(res, "error", "No payment source found")
	const newPaymentSource = order.payment_source as PaymentSource
	return apiRespond(res, "response", {newPaymentSource} as approveCardRes)
}

export default apiHandler({
	"PATCH": approveCardAPI
})