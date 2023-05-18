// Arguably the most professional code I have written in my life
import { NextApiResponse } from "next"

export interface apiResponse<ResType, ErrType> {
	res?: ResType,
	err?: ErrType,
}

/**
 * Sends the error to the client
 * @param res API Response Object
 * @param payload Error Payload
 * @returns false
 */
const ResError = <T,>(res: NextApiResponse, payload: T) => {
	res.status(500)
	if (payload instanceof Error) {
		if (process.env.NODE_ENV === "development") res.send({ err: `${payload.name}: ${payload.message}` } as apiResponse<never, string>)
		else res.send({ err: "Internal Server Error" } as apiResponse<never, string>)
		throw payload
	}
	else res.send({ err: payload } as apiResponse<never, T>)
}

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
	switch (responseType) {
		case "response":
			if(!payload) throw new Error("No Payload")  // 1
			return res.status(200).send({ res: payload } as apiResponse<T, never>)
		case "error":
			if (payload) return ResError(res, payload)
			else return (errorPayload: T) => ResError(res, errorPayload)
		default: throw new Error("API Response Type Not Valid") // 2
	}
	// 1 and 2 are only if apiResponse is not well formed (typescript will catch this)
}

export { apiRespond }