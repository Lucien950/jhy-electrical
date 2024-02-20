// api
import { PaymentSource } from "types/paypal";
import { validateSchema } from "util/typeValidate";
import { approveCardFetch } from "app/api/paypal/approve/approveOrderFetch";
import { approveCardProps, approveCardPropsSchema, approveCardRes } from ".";
import { apiHandler } from "server/api";

async function approveCardHandler(req: Request) {
	const { token, card } = validateSchema<approveCardProps>(await req.json(), approveCardPropsSchema)
	const order = await approveCardFetch(token, card)
	if (!order.payment_source) return new Response('No payment source found', {status: 400})
	const newPaymentSource = order.payment_source as PaymentSource
	return { newPaymentSource } as approveCardRes
}

export const PATCH = (req: Request) => apiHandler(req, approveCardHandler)