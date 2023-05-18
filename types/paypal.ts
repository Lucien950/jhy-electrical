import { Address } from "@paypal/paypal-js"
import Joi from "joi"
import { postalCodeSchema } from "util/shipping/postalCode"

export type addressFields = "address_line_1" | "address_line_2" | "admin_area_1" | "admin_area_2" | "postal_code" | "country_code"

const addressSchema = Joi.object({
	address_line_1: Joi.string().max(300).required(),
	address_line_2: Joi.string().max(300).optional().allow(""),
	admin_area_1: Joi.string().required(),
	admin_area_2: Joi.string().required(),
	postal_code: postalCodeSchema,
	country_code: Joi.string().length(2).required(),
})
export const validateAddress = (candidate?: Address) => (candidate !== undefined) && (addressSchema.validate(candidate).error === undefined)
export const validateAddressError = (candidate?: Address) => addressSchema.validate(candidate).error

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
 * Payment source in @paypal/paypal-js is empty [key]: value type defined
 * Source: https://developer.paypal.com/docs/api/orders/v2/#definition-payment_source
 */
export interface PaymentSource {
	card?: PaymentSourceCard;
	token?: Token;
	paypal?: Paypal;
	bancontact?: Bancontact;
	blik?: Bancontact;
	eps?: Bancontact;
	giropay?: Bancontact;
	ideal?: Bancontact;
	mybank?: Bancontact;
	p24?: Bancontact;
	sofort?: Bancontact;
	trustly?: Bancontact;
	venmo?: Venmo;
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


interface PaymentMethod {
	standard_entry_class_code: string;
	payee_preferred: string;
}
interface Stored {
	payment_initiator: string;
	payment_type: string;
	usage: string;
	previous_network_transaction_reference: PreviousNetworkTransactionReference;
}
interface PreviousNetworkTransactionReference {
	id: string;
	date: string;
	network: string;
}
interface Name {
	given_name: string;
	surname: string;
}
interface Phone {
	phone_type: string;
	phone_number: PhoneNumber;
}
interface PhoneNumber {
	national_number: string;
}
interface TaxInfo {
	tax_id: string;
	tax_id_type: string;
}
interface Bancontact {
	name: string;
	country_code: string;
	experience_context: BancontactExperienceContext;
	email?: string;
	bic?: string;
}
interface BancontactExperienceContext {
	brand_name: string;
	shipping_preference: string;
	locale: string;
	return_url: string;
	cancel_url: string;
}
interface PaymentSourceCard {
	name: string;
	number: string;
	security_code: string;
	expiry: string;
	billing_address: Address;
	attributes: CardAttributes;
	stored_credential: Stored;
	vault_id: string;
}
interface CardAttributes {
	customer: PurpleCustomer;
	vault: PurpleVault;
}
interface PurpleCustomer {
	id: string;
	email_address: string;
	phone: Phone;
}
interface PurpleVault {
	store_in_vault: string;
}
interface Context {
	brand_name: string;
	landing_page: string;
	shipping_preference: string;
	user_action: string;
	return_url: string;
	cancel_url: string;
	locale: string;
	payment_method?: PaymentMethod;
	stored_payment_source?: Stored;
	payment_method_preference?: string;
	payment_method_selected?: string;
}
interface Paypal {
	experience_context: Context;
	billing_agreement_id: string;
	vault_id: string;
	email_address: string;
	name: Name;
	phone: Phone;
	birth_date: string;
	tax_info: TaxInfo;
	address: Address;
	attributes: PaypalAttributes;
}
interface PaypalAttributes {
	customer: FluffyCustomer;
	vault: FluffyVault;
}
interface FluffyCustomer {
	id: string;
}
interface FluffyVault {
	store_in_vault: string;
	description: string;
	usage_pattern: string;
	usage_type: string;
	customer_type: string;
	permit_multiple_payment_tokens: boolean;
}
interface Token {
	id: string;
	type: string;
}
interface Venmo {
	experience_context: VenmoExperienceContext;
	vault_id: string;
	email_address: string;
	attributes: PaypalAttributes;
}
interface VenmoExperienceContext {
	brand_name: string;
	shipping_preference: string;
}