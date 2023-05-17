// Arguably the most professional code I have written in my life
import { NextApiResponse } from "next"

export interface apiResponse<ResType, ErrType> {
	res?: ResType,
	err?: ErrType,
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
/**
 * Gives a API response handler for TRY-CATCH ERROR
 * WHEN THROWING ERRORS, ALWAYS CONVERT TO STRING, as this will try to convert it back to JSON.
 * @param res NextAPI res object
 * @param responseType "error"
 * @example func().catch(apiResponse(res, "error"))
 */
function apiRespond(res: NextApiResponse, responseType: "error"): (<T, >(errorPayload: T) => false);
function apiRespond<T>(res: NextApiResponse, responseType: string, payload?: T) {
	switch (responseType) {
		case "response":
			if(!payload) throw new Error("No Payload")
			return res.status(200).send({ res: payload } as apiResponse<T, never>)
		case "error":
			if (payload){
				res.status(500)
				if (payload instanceof Error) res.send({ err: `${payload.name}: ${payload.message}` } as apiResponse<never, string>)
				else res.send({ err: payload } as apiResponse<never, T>)
				return false
			}
			else return ((errorPayload: T) => {
				res.status(500)
				if (errorPayload instanceof Error) res.send({ err: `${errorPayload.name}: ${errorPayload.message}` } as apiResponse<never, string>)
				else res.send({err: errorPayload} as apiResponse<never, T>)
				return false
			})
		default: throw new Error("API Response Type Not Valid")
	}
}

export { apiRespond }