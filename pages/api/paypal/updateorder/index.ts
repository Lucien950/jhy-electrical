import { Address } from "@paypal/paypal-js"
import { PriceInterface } from "util/priceUtil";
export type updateOrderProps = { token: string, address: Address, name: {firstName: string, lastName: string} }
export type updateOrderReturn = { newPrice: PriceInterface }