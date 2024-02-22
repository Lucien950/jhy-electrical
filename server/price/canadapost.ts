import { DEVENV } from "types/env";
import { toB64 } from "util/string";
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { GetRatesRes } from "types/canadapost";

type CanadaPostErrorCode = 400 | 401 | 403 | 404 | 406 | 412 | 415 | 500
interface CanadaPostError {
	"messages": {
		"message": {
			"code": number | "Server", // https://www.canadapost-postescanada.ca/info/mc/business/productsservices/developers/messagescodetables.jsf#error_messages
			"description": string
		}
	}
}
const CANADAPOST_USERID = (DEVENV ? process.env.CANADAPOST_USERID_DEV : process.env.CANADAPOST_USERID) || null
const CANADA_POST_PASS = (DEVENV ? process.env.CANADAPOST_PASSWORD_DEV : process.env.CANADAPOST_PASSWORD) || null
const CANADAPOST_BASICAUTH = CANADAPOST_USERID && CANADA_POST_PASS ? toB64(`${CANADAPOST_USERID}:${CANADA_POST_PASS}`) : null
const CANADAPOST_LANG = "en-CA" // pass as "Accept-Language" header
const ORIGIN_POSTAL_CODE = process.env.ORIGIN_POSTAL_CODE || null
const CANADAPOST_DOMAIN = new URL(process.env.NODE_ENV === "development" ? "https://ct.soa-gw.canadapost.ca" : "https://soa-gw.canadapost.ca")

export async function canadaPost_getRates(destinationPostalCode: string, {length, width, height, weight}: productPackageInfo){
	if (!CANADAPOST_BASICAUTH || !ORIGIN_POSTAL_CODE) throw new Error("Problem with Environment Variables")
  let requestBody: string = new XMLBuilder({
    ignoreAttributes : false
	}).build({
		"mailing-scenario": {
			"parcel-characteristics": {
				weight: weight,
				dimensions: { length, width, height }
			},
			"quote-type": "counter",
			// "customer-number": "12345",
			// "contract-id": "67890",
			"origin-postal-code": ORIGIN_POSTAL_CODE,
			destination: {
				domestic: {
					"postal-code": destinationPostalCode
				}
			},
			"@_xmlns": "http://www.canadapost.ca/ws/ship/rate-v4",
		}
	});
	const requestURL = CANADAPOST_DOMAIN
	requestURL.pathname = "rs/ship/price"
	const response = await fetch(requestURL, {
		headers: {
			"Authorization": `Basic ${CANADAPOST_BASICAUTH}`,
			"Content-Type": "application/vnd.cpc.ship.rate-v4+xml",
			"Accept": "application/vnd.cpc.ship.rate-v4+xml",
			"Accept-Language": CANADAPOST_LANG	
		},
		body: requestBody,
		method: "POST"
	});
	
	const parser = new XMLParser({
		ignoreAttributes : false
	});

	const response_text = await response.text()
	if(!response.ok) {
		const errObj: CanadaPostError = parser.parse(response_text);
		const errorExplain = getErrorExplaination(response.status as CanadaPostErrorCode)
		console.error(errorExplain, errObj)
		throw new Error(JSON.stringify({
			explaination: errorExplain,
			message: `(${errObj.messages.message.code}) ${errObj.messages.message.description}`
		}))
	}

	const resObj: GetRatesRes = parser.parse(response_text);
  return resObj["price-quotes"]["price-quote"]
}

function getErrorExplaination(code: CanadaPostErrorCode): string {
  switch (code) {
    case 400:
      return 'Bad Request'
    case 401:
      return 'Correct the API key in the "Authorization" header.'
    case 403:
      return 'Forbidden'
    case 404:
      return 'The resource path is incorrect or the resource is no longer available. If received for a recently created resource, retry later.'
    case 406:
      return 'The interface version expected to be returned by the request (GET) is invalid or not supported. Change the "accept" header variable.'
    case 412:
      return 'This is an unexpected error indicating that some precondition for a one-step shipment has failed. This can happen as a result of non-synchronized process at the server side. The user action would be to verify the input data and repeat the transaction after a short time. If it fails again, report it.'
    case 415:
      return 'The interface version declared in the request (POST) is invalid or not supported. Change the "content-type" header variable.'
    case 500:
      return 'Correct the XML schema error as per the detailed message.'
  }
}
export interface productPackageInfo {
	width: number;
	height: number;
	length: number;
	weight: number;
	id: string;
	quantity: number;
}
