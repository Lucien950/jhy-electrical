import { Address } from "@paypal/paypal-js"
import { PriceInterface } from "util/priceUtil";
export type updateOrderProps = { token: string, address: Address, fullName: string}
export type updateOrderRes = { newPrice: PriceInterface }