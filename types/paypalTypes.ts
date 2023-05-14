import { Address } from "@paypal/paypal-js"

export interface PayPalAuth {
	scope: string;
	access_token: string;
	token_type: string;
	app_id: string;
	expires_in: number;
	nonce: string;
}

export interface PayPalCreateOrder {
	id: string;
	status: string;
	links: LinksEntity[];
}
export interface LinksEntity {
	href: string;
	rel: string;
	method: string;
}

export interface PaypalOrder {
	name?: string;
	id: string;
	intent: string;
	status: string;
	payment_source: PaymentSource;
	purchase_units: PurchaseUnitsEntity[];
	payer: Payer;
	create_time: string;
	links: LinksEntity[];
}
export interface PaymentSource {
	paypal: Paypal;
}
export interface Paypal {
	email_address: string;
	account_id: string;
	name: Name;
	address: Address;
}
export interface Name {
	given_name: string;
	surname: string;
}
export interface PurchaseUnitsEntity {
	reference_id: string;
	amount: Amount;
	payee: Payee;
	shipping: Shipping;
}
export interface Amount {
	currency_code: string;
	value: string;
}
export interface Payee {
	email_address: string;
	merchant_id: string;
	display_data: DisplayData;
}
export interface DisplayData {
	brand_name: string;
}
export interface Shipping {
	name: Name1;
	address: Address;
}
export interface Name1 {
	full_name: string;
}
export interface Payer {
	name: Name;
	email_address: string;
	payer_id: string;
	address: Address;
}
export interface LinksEntity {
	href: string;
	rel: string;
	method: string;
}
