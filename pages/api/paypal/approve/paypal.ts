import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler, apiRespond } from "server/api";
import Joi from "joi";
import { validateSchema } from "util/typeValidate";
import { approvePayPalFetch } from "server/paypal/approveOrderFetch";

export type approvePayPalProps = { token: string }
const approvePayPalPropsSchema = Joi.object({ token: Joi.string().required() })
export type approvePayPalRes = { redirect_link: string }

async function approvePayPalAPI(req: NextApiRequest, res: NextApiResponse) {
	const { token } = validateSchema<approvePayPalProps>(req.body, approvePayPalPropsSchema)
	const order = await approvePayPalFetch(token)
	const redirectObj = order.links.find(l => l.rel === "payer-action")
	if (!redirectObj) return apiRespond(res, "error", "No redirect link found")
	return apiRespond(res, "response", { redirect_link: redirectObj.href } as approvePayPalRes)
}

export default apiHandler({
	"PATCH": approvePayPalAPI
})