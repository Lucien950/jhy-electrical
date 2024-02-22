// api
import { PaymentSource } from "types/paypal";
import { approveCardFetch } from "app/api/paypal/approve/approveOrderFetch";
import { attemptApproveCardProps, approveCardRes } from ".";
import { apiHandler } from "server/api";

async function approveCardHandler(req: Request) {
	const { token, card } = attemptApproveCardProps(await req.json())
	const order = await approveCardFetch(token, card)
	if (!order.payment_source) return new Response('No payment source found', {status: 400})
	const newPaymentSource = order.payment_source as PaymentSource
	return { newPaymentSource } as approveCardRes
}

export const dynamic = 'force-dynamic'
export const PATCH = (req: Request) => apiHandler(req, approveCardHandler)