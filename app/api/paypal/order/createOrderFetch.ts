// util
import { DOMAIN } from "types/domain"
import { PAYPALDOMAIN } from "app/api/paypal/paypalDomain";
// types
import { PayPalError } from 'types/paypal';
import { FormPrice } from "types/price";
// paypal
import { CreateOrderRequestBody, OrderResponseBody } from "@paypal/paypal-js"
import { generateAccessToken } from "server/paypal";
import { encodeProductVariantPayPalSku } from "server/paypal/sku";
import { OrderProduct } from "types/order";
import { ProductWithVariant } from "types/product";

export async function createOrderAPICall(paymentInformation: FormPrice, productIDS: (OrderProduct & {product: ProductWithVariant})[], express: boolean) {
	const orderInformation = {
		intent: "AUTHORIZE",
		purchase_units: [{
			items: productIDS.map(p => ({
				name: p.product.productName,
				quantity: p.quantity.toString(),
				sku: encodeProductVariantPayPalSku(p.PID, p.variantSKU),
				unit_amount: {
					currency_code: "CAD",
					value: p.product.price.toFixed(2)
				}
			})),
			amount: {
				currency_code: "CAD",
				value: paymentInformation.total.toFixed(2),
				breakdown: {
					item_total: {
						currency_code: "CAD",
						value: paymentInformation.subtotal.toFixed(2)
					},
					shipping: {
						currency_code: "CAD",
						value: (paymentInformation.shipping || 0).toFixed(2)
					},
					tax_total: {
						currency_code: "CAD",
						value: (paymentInformation.tax || 0).toFixed(2)
					},
				}
			}
		}],
		application_context: {
			return_url: `${DOMAIN}/checkout`,
			cancel_url: `${DOMAIN}/${express ? "cart" : "checkout"}`,
			brand_name: "JHY Electrical"
		},
	} as CreateOrderRequestBody

	const response = await fetch(`${PAYPALDOMAIN}/v2/checkout/orders`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await generateAccessToken()}`,
		},
		body: JSON.stringify(orderInformation)
	})
	const data = await response.json()
	if (response.ok) return data as OrderResponseBody
	else throw data as PayPalError
}