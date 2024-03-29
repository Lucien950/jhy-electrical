import { approvePayPalFetch } from "app/api/paypal/approve/approveOrderFetch";
import { Error400, apiHandler } from "server/api";
import { approvePayPalRes, attemptApprovePayPalProps } from ".";

async function approvePayPalHandler(req: Request): Promise<approvePayPalRes> {
	const { token } = attemptApprovePayPalProps(await req.json()) //
	const order = await approvePayPalFetch(token)
	const redirectObj = order.links?.find(l => l.rel === "payer-action")
	if (!redirectObj) throw new Error400("No redirect link found", 404)
	return { redirect_link: redirectObj.href }
}

export const dynamic = 'force-dynamic'
export const PATCH = (req: Request) => apiHandler(req, approvePayPalHandler)