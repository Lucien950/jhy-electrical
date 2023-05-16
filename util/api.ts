// Arguably the most professional code I have written in my life
import { NextApiResponse } from "next"

export interface apiResponse<ResType, ErrType> {
	res?: ResType,
	err?: ErrType, //must send string unless want to serialize error?
}

/**
 * Gives a API response handler for generated data
 * @param res NextAPI res object
 * @param responseType "response"
 * @param payload Payload to send to client
 * @example apiResponse(res, "response", [YOURPAYLOAD]) //equiv to res.status(200).send(payload(apiResponse wrapper))
 */
function apiRespond<T>(res: NextApiResponse, responseType: "response", payload: T): void;
/**
 * Gives a API response handler for Error
 * @param res NextAPI res object
 * @param responseType "error"
 * @param payload Error to send to client
 * @example apiResponse(res, "error", [ERRORPAYLOAD]) //equiv to res.status(500).send(payload(apiResponse wrapper))
 */
function apiRespond<T>(res: NextApiResponse, responseType: "error", payload: T): void;
/**
 * Gives a API response handler for try catch Error
 * @param res NextAPI res object
 * @param responseType "error"
 * @example func().catch(apiResponse(res, "error"))
 */
function apiRespond(res: NextApiResponse, responseType: "error"): ((errorPayload: Error) => false);
function apiRespond<T>(res: NextApiResponse, responseType: string, payload?: T) {
	switch (responseType) {
		case "response":
			if(!payload) throw new Error("No Payload")
			res.status(200).send({ res: payload } as apiResponse<T, never>)
			break
		case "error":
			if (payload) res.status(500).send({ err: payload } as apiResponse<never, T>)
			else return ((errorPayload: Error) =>{
				res.status(500).send({ err: errorPayload.message } as apiResponse<never, string>)
				return false
			})
		default: throw new Error("API Response Type Not Valid")
	}
}

export { apiRespond }