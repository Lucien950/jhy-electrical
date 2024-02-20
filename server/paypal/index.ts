// types
import { OrderResponseBody } from "@paypal/paypal-js";
import { FormCustomer, isPaymentMethod } from "types/customer";
import { OrderProduct } from "types/order";
import { PayPalAuth, PayPalError, PayPalSimpleError } from "types/paypal";
import { FormPrice } from "types/price";
import { Address } from "types/address";
// utils
import { PAYPALDOMAIN } from "app/api/paypal/paypalDomain";
import { DEVENV } from "types/env";
import { decodeProductVariantPayPalSku } from "./sku";
import { makePrice } from "server/priceUtil";
import { toB64 } from "util/string";
import { ArrayElement } from "types/util";
import { fillOrderProducts } from "util/order";


const calculateOrderPrice = (orderPurchaseUnit: ArrayElement<NonNullable<OrderResponseBody["purchase_units"]>>): FormPrice => {
	const amount = orderPurchaseUnit.amount;
	const breakdown = (amount?.breakdown)!; //eslint-disable-line @typescript-eslint/no-non-null-assertion
	const taxTotal = breakdown.tax_total?.value;
	const shippingTotal = breakdown.shipping?.value;
	const finalcalculated = taxTotal !== undefined && shippingTotal !== undefined;
	return finalcalculated ? {
		subtotal: Number(breakdown.item_total!.value), //eslint-disable-line @typescript-eslint/no-non-null-assertion
		tax: Number(taxTotal),
		shipping: Number(shippingTotal),
		total: Number(amount?.value ?? 0)
	}
		:
		{
			subtotal: Number(breakdown.item_total!.value), //eslint-disable-line @typescript-eslint/no-non-null-assertion
			total: Number(amount?.value ?? 0)
		};
}
/**
 * Gets order from paypal of the given orderID. MUST BE CALLED ON THE SERVER.
 * @param orderID ID of the order we are interested in
 * @returns Order we are interested in
 * @throws Error if paypal throws an error
 * @throws Error if the order does not have a purchase unit
 * @throws Error if the payment method is not supported
 */
export async function getPayPalOrder (orderID: string) {
	const accessToken = await generateAccessToken();
	const response = await fetch(`${PAYPALDOMAIN}/v2/checkout/orders/${orderID}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});
	if (!response.ok) throw await response.json() as PayPalError;

	const order_data: OrderResponseBody = await response.json();

	// shipping
	if(!order_data.purchase_units) throw new Error("No purchase units found in order, thus we have an invalid order");
	const orderPurchaseUnit = order_data.purchase_units[0];
	const shipping = orderPurchaseUnit.shipping;
	// CUSTOMER INFORMATION
	const customerInfo = {
		fullName: shipping?.name?.full_name || null,
		address: shipping?.address || null,
	} as FormCustomer;
	// little validation
	if (shipping?.address?.country_code && shipping.address.country_code != "CA") throw new Error("Do not ship outside Canada");

	// customerInfo.
	if (["APPROVED", "COMPLETED"].includes(order_data.status ?? "")) {
		const paymentMethod = order_data.payment_source ? Object.keys(order_data.payment_source)[0] : null;
		if(!isPaymentMethod(paymentMethod)) throw new Error("Payment method not given or supported");
		customerInfo.paymentMethod = paymentMethod;
		customerInfo.paymentSource = order_data.payment_source;
	}

	// products
	const products: OrderProduct[] = orderPurchaseUnit.items!.map(i => {
		const { productID, variantID } = decodeProductVariantPayPalSku(i.sku!);
		return {
			PID: productID,
			quantity: Number(i.quantity),
			variantSKU: variantID,
		};
	});

	return {
		PayPalCustomer: customerInfo,
		orderPrice: calculateOrderPrice(orderPurchaseUnit),
		products,
		redirect_link: order_data.links?.find(v => v.rel == "approve")?.href || null,
		status: order_data.status
	};
};



export const updatePayPalOrderAddress = async (token: string, newAddress: Address, fullName: string) => {
	const orders = await getPayPalOrder(token);
	const newPrice = await makePrice(await fillOrderProducts(orders.products), newAddress);
	const patchOrderBody = [
		{
			op: "add",
			path: `/purchase_units/@reference_id=='default'/shipping/address`,
			value: newAddress
		},
		{
			op: "add",
			path: "/purchase_units/@reference_id=='default'/shipping/name",
			value: {
				full_name: fullName
			}
		},
		{
			op: "replace",
			path: `/purchase_units/@reference_id=='default'/amount`,
			value: {
				currency_code: "CAD",
				value: newPrice.total.toFixed(2),
				breakdown: {
					item_total: {
						currency_code: "CAD",
						value: newPrice.subtotal.toFixed(2)
					},
					shipping: {
						currency_code: "CAD",
						value: newPrice.shipping.toFixed(2)
					},
					tax_total: {
						currency_code: "CAD",
						value: newPrice.tax.toFixed(2)
					},
				}
			}
		}
	];

	const response = await fetch(`${PAYPALDOMAIN}/v2/checkout/orders/${token}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await generateAccessToken()}`
		},
		body: JSON.stringify(patchOrderBody)
	});
	if (!response.ok) throw await response.json() as PayPalError;
	return newPrice;
};


export const generateAccessToken = async () => {
	const clientid = DEVENV
		? process.env.PAYPAL_CLIENTID_DEV
		: process.env.PAYPAL_CLIENTID;
	const secret = DEVENV
		? process.env.PAYPAL_CLIENT_SECRET_DEV
		: process.env.PAYPAL_CLIENT_SECRET;
	if (clientid === undefined || secret === undefined) throw new Error("Cannot generateAccessToken: PayPal clientid or secret not found");
	const auth = toB64(`${clientid}:${secret}`);
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${auth}`
		},
		body: new URLSearchParams({ grant_type: 'client_credentials' })
	};

	const response = await fetch(`${PAYPALDOMAIN}/v1/oauth2/token`, options);
	if (response.ok) return (await response.json() as PayPalAuth).access_token;
	else throw await response.json() as PayPalSimpleError;
};

