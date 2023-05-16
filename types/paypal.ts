import { Address } from "@paypal/paypal-js"

export type addressFields = "address_line_1" | "address_line_2" | "admin_area_1" | "admin_area_2" | "postal_code" | "country_code"

// Generate Token
export interface PayPalAuth {
	scope: string;
	access_token: string;
	token_type: string;
	app_id: string;
	expires_in: number;
	nonce: string;
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

export interface PaymentMethod {
	standard_entry_class_code: string;
	payee_preferred: string;
}
export interface Stored {
	payment_initiator: string;
	payment_type: string;
	usage: string;
	previous_network_transaction_reference: PreviousNetworkTransactionReference;
}
export interface PreviousNetworkTransactionReference {
	id: string;
	date: string;
	network: string;
}
export interface Name {
	given_name: string;
	surname: string;
}
export interface Phone {
	phone_type: string;
	phone_number: PhoneNumber;
}
export interface PhoneNumber {
	national_number: string;
}
export interface TaxInfo {
	tax_id: string;
	tax_id_type: string;
}
export interface Bancontact {
	name: string;
	country_code: string;
	experience_context: BancontactExperienceContext;
	email?: string;
	bic?: string;
}
export interface BancontactExperienceContext {
	brand_name: string;
	shipping_preference: string;
	locale: string;
	return_url: string;
	cancel_url: string;
}
export interface PaymentSourceCard {
	name: string;
	number: string;
	security_code: string;
	expiry: string;
	billing_address: Address;
	attributes: CardAttributes;
	stored_credential: Stored;
	vault_id: string;
}
export interface CardAttributes {
	customer: PurpleCustomer;
	vault: PurpleVault;
}
export interface PurpleCustomer {
	id: string;
	email_address: string;
	phone: Phone;
}
export interface PurpleVault {
	store_in_vault: string;
}
export interface Context {
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
export interface Paypal {
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
export interface PaypalAttributes {
	customer: FluffyCustomer;
	vault: FluffyVault;
}
export interface FluffyCustomer {
	id: string;
}
export interface FluffyVault {
	store_in_vault: string;
	description: string;
	usage_pattern: string;
	usage_type: string;
	customer_type: string;
	permit_multiple_payment_tokens: boolean;
}
export interface Token {
	id: string;
	type: string;
}
export interface Venmo {
	experience_context: VenmoExperienceContext;
	vault_id: string;
	email_address: string;
	attributes: PaypalAttributes;
}
export interface VenmoExperienceContext {
	brand_name: string;
	shipping_preference: string;
}