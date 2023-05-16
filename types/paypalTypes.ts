import { Address } from "@paypal/paypal-js"

// Manual
export interface PayPalAuth {
	scope: string;
	access_token: string;
	token_type: string;
	app_id: string;
	expires_in: number;
	nonce: string;
}

export type addressFields = "address_line_1" | "address_line_2" | "admin_area_1" | "admin_area_2" | "postal_code" | "country_code"

// // RESPONSE FOR PAYPAL.CREATEORDER()
// export interface PayPalCreateOrder {
// 	id: string;
// 	status: string;
// 	links: LinksEntity[];
// }
// export interface LinksEntity {
// 	href: string;
// 	rel: string;
// 	method: string;
// }

// // RESPONSE FOR PAYPAL.GETORDER()
// export interface PaypalOrder {
// 	name?: string; //ONLY FOR ERRORS
// 	id: string;    //ONLY PRESENT WHEN GETTING ORDER
// 	status: string; //ONLY PRESENT WHEN GETTING ORDER
// 	intent: string;
// 	payment_source: PaymentSource;
// 	purchase_units: PurchaseUnit[];
// 	payer: Payer;
// 	create_time: Date,
// 	links: LinksEntity[];
// }
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

// export interface Payer {
// 	email_address: string;
// 	name: Name;
// 	phone: Phone;
// 	birth_date: string;
// 	tax_info: TaxInfo;
// 	address: Address;
// }

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

// export interface PurchaseUnit {
// 	reference_id: string;
// 	description: string;
// 	custom_id: string;
// 	invoice_id: string;
// 	soft_descriptor: string;
// 	items: Item[];
// 	amount: Amount;
// 	payee: Payee;
// 	payment_instruction: PaymentInstruction;
// 	shipping: Shipping;
// 	supplementary_data: SupplementaryData;
// }

// export interface Amount {
// 	currency_code: string;
// 	value: string;
// 	breakdown: Breakdown;
// }

// export interface Breakdown {
// 	item_total: Discount;
// 	shipping: Discount;
// 	handling: Discount;
// 	tax_total: Discount;
// 	insurance: Discount;
// 	shipping_discount: Discount;
// 	discount: Discount;
// }

// export interface Discount {
// 	currency_code: string;
// 	value: string;
// }

// export interface Item {
// 	name: string;
// 	quantity: string;
// 	description: string;
// 	sku: string;
// 	category: string;
// 	unit_amount: Discount;
// 	tax: Discount;
// }

// export interface Payee {
// 	email_address: string;
// 	merchant_id: string;
// }

// export interface PaymentInstruction {
// 	platform_fees: PlatformFee[];
// 	payee_pricing_tier_id: string;
// 	payee_receivable_fx_rate_id: string;
// 	disbursement_mode: string;
// }

// export interface PlatformFee {
// 	amount: Discount;
// 	payee: Payee;
// }

// export interface Shipping {
// 	type: string;
// 	name: Name;
// 	address: Address;
// }

// export interface SupplementaryData {
// 	card: SupplementaryDataCard;
// }

// export interface SupplementaryDataCard {
// 	level_2: Level2;
// 	level_3: Level3;
// }

// export interface Level2 {
// 	invoice_id: string;
// 	tax_total: Discount;
// }

// export interface Level3 {
// 	ships_from_postal_code: string;
// 	line_items: { [key: string]: null }[];
// 	shipping_amount: Discount;
// 	duty_amount: Discount;
// 	discount_amount: Discount;
// 	shipping_address: Address;
// }