import { OrderResponseBody } from "@paypal/paypal-js";
import { CustomerInterface } from "types/customer";
import { OrderProduct } from "types/order";
import { PayPalAuth, PayPalError, PayPalSimpleError } from "types/paypal";
import { FinalPriceInterface, PriceInterface } from "types/price";
import { PAYPALDOMAIN } from "app/api/paypal/paypalDomain";
import { decodePayPalSKU } from "./sku";
import { makePrice } from "server/priceUtil";
import { Address } from "types/address";
import { DEVENV } from "types/env";
import { toB64 } from "util/string";

/**
 * Gets order from paypal of the given orderID. MUST BE CALLED ON THE SERVER.
 * @param orderID ID of the order we are interested in
 * @returns Order we are interested in
 */

export const getPayPalOrder = async (orderID: string) => {
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
	const purchaseUnit0 = order_data.purchase_units![0];
	const shipping = purchaseUnit0.shipping;
	// CUSTOMER INFORMATION
	const customerInfo = {
		fullName: shipping?.name?.full_name || null,
		address: shipping?.address || null,
	} as CustomerInterface;
	// little validation
	if (shipping?.address?.country_code && shipping.address.country_code != "CA") throw new Error("Do not ship outside Canada");

	// customerInfo.
	if (["APPROVED", "COMPLETED"].includes(order_data.status ?? "")) {
		//eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		customerInfo.paymentMethod = Object.keys(order_data.payment_source!)[0] as "card" | "paypal";
		//eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		customerInfo.payment_source = order_data.payment_source;
	}

	// PAYMENT INFORMATION
	const amount = purchaseUnit0.amount;
	const breakdown = (amount?.breakdown)!; //eslint-disable-line @typescript-eslint/no-non-null-assertion
	const taxTotal = breakdown.tax_total?.value;
	const shippingTotal = breakdown.shipping?.value;
	const finalcalculated = !!taxTotal && !!shippingTotal;
	const priceInfo = finalcalculated ? {
		subtotal: Number(breakdown.item_total!.value), //eslint-disable-line @typescript-eslint/no-non-null-assertion
		tax: Number(taxTotal),
		shipping: Number(shippingTotal),
		total: Number(amount?.value ?? 0)
	} as FinalPriceInterface
		:
		{
			subtotal: Number(breakdown.item_total!.value), //eslint-disable-line @typescript-eslint/no-non-null-assertion
			total: Number(amount?.value ?? 0)
		} as PriceInterface;

	// products
	const products: OrderProduct[] = purchaseUnit0.items!.map(i => {
		const { productID, variantID } = decodePayPalSKU(i.sku!);
		return {
			PID: productID,
			quantity: Number(i.quantity),
			variantSKU: variantID,
		};
	});

	// redirect link
	const redirect_link = order_data.links?.find(v => v.rel == "approve")?.href || null;

	const status = order_data.status;

	return { customerInfo, priceInfo, products, redirect_link, status };
};



export const updatePayPalOrderAddress = async (token: string, newAddress: Address, fullName: string) => {
	const orders = await getPayPalOrder(token);
	const newPrice = await makePrice(orders.products, newAddress);
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

