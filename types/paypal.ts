import { Address } from "@paypal/paypal-js"
import Joi from "joi"
import { postalCodeSchema } from "util/shipping/postalCode"

export type addressFields = "address_line_1" | "address_line_2" | "admin_area_1" | "admin_area_2" | "postal_code" | "country_code"
export const addressSchema = Joi.object({
	address_line_1: Joi.string().max(300).required(),
	address_line_2: Joi.string().max(300).optional().allow(""),
	admin_area_1: Joi.string().required(),
	admin_area_2: Joi.string().required(),
	postal_code: postalCodeSchema,
	country_code: Joi.string().length(2).required(),
})
export const validateAddress = (candidate: Address | null) => (candidate !==  null) && (addressSchema.validate(candidate).error === undefined)
export const validateAddressError = (candidate: Address | null) => addressSchema.validate(candidate).error

/**
 * Token Type
 * https://developer.paypal.com/api/rest/authentication/#sample-response
 */
export interface PayPalAuth {
	scope: string;
	access_token: string;
	token_type: string;
	app_id: string;
	expires_in: number;
	nonce: string;
}

/**
 * Client Token
 * https://developer.paypal.com/docs/multiparty/checkout/advanced/integrate/#link-sampleclienttokenrequest
 */
export interface PayPalClientToken {
	client_token: string;
	expires_in: number;
}

/**
 * Default Type for Errors (use mostly for Order API)
 */
export interface PayPalError {
	name: string;
	message: string;
	debug_id: string;
	details: Detail[];
	links: Link[];
}
export interface Detail {
	field: string;
	value: string;
	location: string;
	issue: string;
	description: string;
}

export interface Link {
	href: string;
	rel: string;
	encType: string;
}

export interface PayPalSimpleError {
	error: string;
	error_description: string;
}

/**
 * Payment source in @paypal/paypal-js is empty [key]: value type defined
 * This is the payment source object returning from the API (to be distinguished from the one given to the API)
 * https://developer.paypal.com/docs/api/orders/v2/#definition-payment_source_response
 */
export interface PaymentSource {
	card?: Card;
	paypal?: Paypal;
	blik?: Blik;
	p24?: P24;
	venmo?: Venmo;
	bancontact?: INCard;
	sofort?: INCard;
	trustly?: INCard;
	eps?: INBank;
	giropay?: INBank;
	ideal?: INBank;
	mybank?: INBank;
}
export interface INBank {
	name: string;
	country_code: string;
	bic: string;
	iban_last_chars?: string;
}
export interface INCard extends INBank {
	card_last_digits?: string;
}
export interface Blik {
	name: string;
	country_code: string;
	email: string;
}
export interface Card {
	name: string;
	last_digits: string;
	type: string;
	from_request: FromRequest;
	brand: string;
	authentication_result: AuthenticationResult;
	attributes: { vault: Vault; };
	expiry: string;
}
export interface Vault {
	id: string;
	status: string;
	links: Link[];
	customer: {
		id: string;
	};
}

export interface Link {
	href: string;
	rel: string;
	method: string;
}
export interface AuthenticationResult {
	liability_shift: string;
	three_d_secure: ThreeDSecure;
}
export interface ThreeDSecure {
	authentication_status: string;
	enrollment_status: string;
}
export interface FromRequest {
	last_digits: string;
	expiry: string;
}
export interface P24 {
	payment_descriptor: string;
	method_id: string;
	method_description: string;
	name: string;
	email: string;
	country_code: string;
}
export interface Paypal {
	phone_type: string;
	attributes: { vault: Vault; };
	email_address: string;
	account_id: string;
	name: Name;
	phone_number: PhoneNumber;
	birth_date: string;
	tax_info: TaxInfo;
	address: Address;
}
export interface Name {
	given_name: string;
	surname: string;
}
export interface PhoneNumber {
	national_number: string;
}
export interface TaxInfo {
	tax_id: string;
	tax_id_type: string;
}
export interface Venmo {
	user_name: string;
	attributes: { vault: Vault; };
	email_address: string;
	account_id: string;
	name: Name;
	phone_number: PhoneNumber;
	address: Address;
}