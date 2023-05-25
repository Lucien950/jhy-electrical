// Arguably the most professional code I have written in my life
import Joi from "joi"
import { NextApiRequest, NextApiResponse } from "next"

export interface apiResponse<ResType, ErrType> { res?: ResType, err?: ErrType, }

/**
 * Gives a API response handler for data
 * @param res NextAPI res object
 * @param responseType "response"
 * @param payload Payload to send to client
 * @example apiResponse(res, "response", [YOURPAYLOAD]) //equiv to res.status(200).send(payload(apiResponse wrapper))
 */
function apiRespond<T>(res: NextApiResponse, responseType: "response", payload: T): void;
/**
 * Gives a API response handler for SPECIFIED Error
 * @param res NextAPI res object
 * @param responseType "error"
 * @param payload SPECIFIED Error to send to client
 * @example apiResponse(res, "error", [ERRORPAYLOAD]) //equiv to res.status(500).send(payload(apiResponse wrapper))
 */
function apiRespond<T>(res: NextApiResponse, responseType: "error", payload: T): void;
function apiRespond<T>(res: NextApiResponse, responseType: "response" | "error", payload: T) {
	if(!["response", "error"].includes(responseType)) throw new Error("API Response Type Not Valid") // 1
	if(!payload) throw new Error("No Payload")  // 2
	switch (responseType) {
		case "response": return res.status(200).send({ res: payload } as apiResponse<T, never>)
		case "error":
			res.status(500)
			if (payload instanceof Joi.ValidationError){
				return res.send({ err: payload.details.map((detail) => detail.message).join(", ") } as apiResponse<never, string>)
			}
			if (payload instanceof Error) {
				if (process.env.NODE_ENV === "development") res.send({ err: `${payload.name}: ${payload.message}` } as apiResponse<never, string>)
				else res.send({ err: "Internal Server Error" } as apiResponse<never, string>)
			}
			else res.send({ err: payload } as apiResponse<never, T>)
			return
		default: throw new Error("API Response Type Not Valid") // 3
	}
	// 1, 2, 3 are only if apiResponse is not well formed (typescript will catch this)
}

export { apiRespond }

export function apiHandler(handler: {[method: string]: Function}) {
	return async (req: NextApiRequest, res: NextApiResponse) => {
		const method = req.method?.toUpperCase();
		// check handler supports HTTP method
		if (!method) return res.status(405).end(`Method undefined`);
		if (!handler[method]) return res.status(405).end(`Method ${req.method} Not Allowed`);
		try {
			await handler[method](req, res);
		} catch (err) {
			apiRespond(res, "error", err)
		}
	}
}