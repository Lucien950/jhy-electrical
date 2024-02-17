import { OrderProduct } from "types/order";
import { apiResponse } from "server/api";
import { priceAPIProps, priceAPIRes } from "app/api/price";

export const estimatePrice = async (productIDs: OrderProduct[])=>{
	const priceRes = await fetch("/api/price", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ productIDs } as priceAPIProps)
	})
	const {res, err} = await priceRes.json() as apiResponse<priceAPIRes, unknown>
	if(!priceRes.ok) throw err
	return res!.price
}