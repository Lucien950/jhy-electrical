import { components } from "@paypal/paypal-js/types/apis/openapi/checkout_orders_v2"

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
 * Default Type for Errors (use mostly for Order API)
 */
export interface PayPalError {
	name: string;
	message: string;
	debug_id: string;
	details: Detail[];
	links: PayPalErrorLink[];
}
interface Detail {
	field: string;
	value: string;
	location: string;
	issue: string;
	description: string;
}
interface PayPalErrorLink {
	href: string;
	rel: string;
	encType: string;
}

/**
 * Simple Error
 */
export interface PayPalSimpleError {
	error: string;
	error_description: string;
}

/**
 * Payment source in @paypal/paypal-js is empty [key]: value type defined
 * This is the payment source object returning from the API (to be distinguished from the one given to the API)
 * https://developer.paypal.com/docs/api/orders/v2/#definition-payment_source_response
 */
export type PaymentSource = components["schemas"]["payment_source_response"]
export type PayPalAuthorizePaymentSuccess = components["schemas"]["order_authorize_response"]